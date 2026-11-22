import { spawnSync } from "node:child_process";
import { mkdtemp, cp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../",import.meta.url));
const account = "5e0b0e177c2ef7965895e700a245eeec";
const branch = process.env.GITHUB_REF_NAME || spawnSync("git",["branch","--show-current"],{cwd:root,encoding:"utf8"}).stdout.trim();
if (branch !== "feat/hosting" || process.env.CLOUDFLARE_ACCOUNT_ID !== account || !process.env.CLOUDFLARE_API_TOKEN) throw new Error("Vardiya requires its reviewed account, feat/hosting and its own repository secret");
const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/vardiya`,{headers:{Authorization:`Bearer ${process.env.CLOUDFLARE_API_TOKEN}`}});
const result = await response.json();
const project = result.result;
if (!response.ok || !result.success || project.name !== "vardiya" || project.production_branch !== "feat/hosting" || project.source?.type) throw new Error("Refusing upload to an unreviewed Pages target");
for (const config of Object.values(project.deployment_configs ?? {})) {
 for (const key of ["d1_databases","kv_namespaces","r2_buckets","services","durable_object_namespaces","hyperdrive_bindings","ai_bindings"]) {
  if (config[key] && Object.keys(config[key]).length) throw new Error("Runtime bindings prohibited");
 }
}
if (spawnSync(process.execPath,["scripts/prepare-static.mjs"],{cwd:root,stdio:"inherit"}).status !== 0) process.exit(1);
const stage = await mkdtemp(path.join(tmpdir(),"vardiya-pages-"));
try {
 await cp(path.join(root,"out"),stage,{recursive:true});
 const args=[path.join(root,"node_modules/wrangler/bin/wrangler.js"),"pages","deploy",stage,"--project-name","vardiya","--branch","feat/hosting"];
 if (process.env.GITHUB_SHA) args.push("--commit-hash",process.env.GITHUB_SHA);
 const uploaded=spawnSync(process.execPath,args,{cwd:stage,stdio:"inherit",env:process.env});
 if (uploaded.status !== 0) throw new Error("Vardiya upload failed");
} finally { await rm(stage,{recursive:true,force:true}); }
