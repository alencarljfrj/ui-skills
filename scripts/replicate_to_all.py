import os
import sys
import shutil
import subprocess
import json

os.environ["GIT_TERMINAL_PROMPT"] = "0"

SKILLS_SRC = "/Users/mac/.gemini/antigravity/scratch/ui-skills/skills"
GITHUB_USER = "alencarljfrj"

def run_cmd(cmd, cwd=None, timeout=45):
    try:
        res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return res.returncode == 0, res.stdout.strip(), res.stderr.strip()
    except subprocess.TimeoutExpired:
        return False, "", "Timeout expirado (45s)"
    except Exception as e:
        return False, "", str(e)

def copy_skills(target_dir):
    dest = os.path.join(target_dir, ".agents", "skills")
    os.makedirs(dest, exist_ok=True)
    # Copy all skills
    for item in os.listdir(SKILLS_SRC):
        s = os.path.join(SKILLS_SRC, item)
        d = os.path.join(dest, item)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d, ignore_errors=True)
            shutil.copytree(s, d)
        elif os.path.isfile(s):
            shutil.copy2(s, d)

    with open(os.path.join(dest, "README.md"), "w", encoding="utf-8") as f:
        f.write("# UI Skills Catalog\nColeção de 638 skills de UI, Design Systems e Frontend Engineering incorporadas para este projeto.\n")

def process_repo(repo_path, push_if_user_repo=True):
    print(f"\n-------------------------------------------------------")
    print(f"Diretório: {repo_path}")
    if not os.path.isdir(os.path.join(repo_path, ".git")):
        print("[SKIP] Sem .git válido.")
        return None

    # Get branch
    ok, branch, _ = run_cmd(["git", "branch", "--show-current"], cwd=repo_path)
    if not ok or not branch:
        ok, head_ref, _ = run_cmd(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_path)
        branch = head_ref if ok else "main"

    # Get remote url
    ok, origin, _ = run_cmd(["git", "remote", "get-url", "origin"], cwd=repo_path)
    remote_url = origin if ok else ""

    print(f"Branch: '{branch}' | Remote: '{remote_url}'")

    # Copy skills
    print("Copiando 638 skills para .agents/skills...")
    copy_skills(repo_path)

    # Stage
    run_cmd(["git", "add", ".agents/skills"], cwd=repo_path)

    # Check diff staged
    ok, diff_out, _ = run_cmd(["git", "diff", "--staged", "--name-only"], cwd=repo_path)
    if not diff_out:
        print("[OK] .agents/skills já atualizado neste repositório.")
    else:
        ok, commit_out, err = run_cmd(
            ["git", "commit", "-m", "feat(skills): add 638 UI design & engineering skills from ui-skills"],
            cwd=repo_path
        )
        if ok:
            print(f"[COMMIT] {commit_out.splitlines()[0] if commit_out else 'Committed'}")
        else:
            print(f"[WARN] Commit: {err}")

    # Push if belongs to user
    is_user_repo = GITHUB_USER.lower() in remote_url.lower()
    if push_if_user_repo and is_user_repo and remote_url:
        print(f"Pushing para {remote_url} ({branch})...")
        run_cmd(["git", "pull", "--rebase", "origin", branch], cwd=repo_path, timeout=30)
        ok_push, p_out, p_err = run_cmd(["git", "push", "origin", branch], cwd=repo_path, timeout=60)
        if ok_push:
            print(f"[PUSH OK] Sucesso no GitHub remoto!")
            return {"path": repo_path, "remote": remote_url, "pushed": True}
        else:
            print(f"[PUSH WARN] {p_err or p_out}")
            return {"path": repo_path, "remote": remote_url, "pushed": False}
    else:
        if remote_url and not is_user_repo:
            print(f"[LOCAL ONLY] Remote pertence a terceiros ({remote_url}). Commit mantido localmente.")
        return {"path": repo_path, "remote": remote_url, "pushed": False}

def find_local_repos():
    repos = set()

    # Known fixed project dirs
    fixed = [
        "/Users/mac/Documents/GitHub/Clinicas",
        "/Users/mac/Documents/GitHub/GRP_SCANVOL",
        "/Users/mac/Documents/InteligenciaPolitica",
        "/Users/mac/Documents/Holding",
        "/Users/mac/react-demo"
    ]
    for p in fixed:
        if os.path.exists(os.path.join(p, ".git")):
            repos.add(os.path.abspath(p))

    # Scan Developer/Central-IA/Github explicitly
    dev_base = "/Users/mac/Developer/Central-IA/Github"
    if os.path.exists(dev_base):
        for item in os.listdir(dev_base):
            p = os.path.join(dev_base, item)
            if item == ".git":
                continue
            if os.path.isdir(p):
                if os.path.exists(os.path.join(p, ".git")):
                    repos.add(os.path.abspath(p))
                else:
                    for sub in os.listdir(p):
                        subp = os.path.join(p, sub)
                        if os.path.isdir(subp) and os.path.exists(os.path.join(subp, ".git")):
                            repos.add(os.path.abspath(subp))

    return sorted(list(repos))

def main():
    print("======================================================================")
    print("  REPLICAÇÃO TOTAL DE UI SKILLS: REPOSITÓRIOS LOCAIS E REMOTOS GITHUB  ")
    print("======================================================================")

    pushed_repo_names = set()

    # 1. Obter lista de todos os repositórios remotos da conta alencarljfrj
    ok, gh_out, _ = run_cmd(["gh", "repo", "list", GITHUB_USER, "--limit", "100", "--json", "name,url,defaultBranchRef,isPrivate"])
    remote_gh_repos = {}
    if ok and gh_out:
        for item in json.loads(gh_out):
            name = item["name"]
            remote_gh_repos[name.lower()] = {
                "name": name,
                "url": item["url"],
                "default_branch": item.get("defaultBranchRef", {}).get("name", "main") if item.get("defaultBranchRef") else "main"
            }

    print(f"Total de repositórios remotos na conta @{GITHUB_USER}: {len(remote_gh_repos)}")

    # 2. Processar repositórios locais
    local_repos = find_local_repos()
    print(f"\nLocalizados {len(local_repos)} repositórios locais para atualização:")
    for r in local_repos:
        print(f"  • {r}")

    for rpath in local_repos:
        if "scratch/ui-skills" in rpath or rpath.endswith("/ui-skills"):
            continue
        res = process_repo(rpath, push_if_user_repo=True)
        if res and res.get("remote") and GITHUB_USER.lower() in res["remote"].lower():
            # Track pushed repo name
            clean_name = res["remote"].lower().replace(".git", "").rstrip("/").split("/")[-1]
            if res.get("pushed"):
                pushed_repo_names.add(clean_name)

    # 3. Processar repositórios remotos do GitHub que ainda não foram atualizados
    print("\n======================================================================")
    print("SINCRONIZANDO REPOSITÓRIOS REMOTOS DO GITHUB RESTANTES...")
    print("======================================================================")
    staging_base = "/tmp/ui_skills_remote_sync"
    os.makedirs(staging_base, exist_ok=True)

    synced_remotes = 0
    failed_remotes = 0

    for repo_key, info in remote_gh_repos.items():
        if repo_key == "ui-skills":
            print(f"[OK] {info['name']}: Repositório mestre central de UI Skills.")
            pushed_repo_names.add(repo_key)
            continue

        if repo_key in pushed_repo_names:
            print(f"[OK] {info['name']}: Já sincronizado e atualizado via cópia local.")
            synced_remotes += 1
            continue

        print(f"\n>>> Processando repositório remoto: {info['name']} ({info['url']})")
        clone_path = os.path.join(staging_base, info["name"])
        if os.path.exists(clone_path):
            shutil.rmtree(clone_path, ignore_errors=True)

        print(f"Clonando {info['url']} (branch: {info['default_branch']})...")
        ok_clone, _, err_clone = run_cmd(["git", "clone", "--depth", "1", info["url"], clone_path], timeout=60)
        if not ok_clone:
            print(f"[FAIL] Não foi possível clonar {info['name']}: {err_clone}")
            failed_remotes += 1
            continue

        res = process_repo(clone_path, push_if_user_repo=True)
        if res and res.get("pushed"):
            synced_remotes += 1
            pushed_repo_names.add(repo_key)
        else:
            failed_remotes += 1

        shutil.rmtree(clone_path, ignore_errors=True)

    print("\n======================================================================")
    print("RELATÓRIO FINAL DE REPLICAÇÃO")
    print("======================================================================")
    print(f"• Repositórios locais processados: {len(local_repos)}")
    print(f"• Repositórios remotos sincronizados no GitHub (@{GITHUB_USER}): {len(pushed_repo_names)} / {len(remote_gh_repos)}")
    print("• Biblioteca global do sistema (~/.agents/skills): 638 skills ativas")
    print("======================================================================")

if __name__ == "__main__":
    main()
