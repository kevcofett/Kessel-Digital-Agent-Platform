# MPA v6.0 Merge Commands

## Pre-Merge Checklist

- [x] All 25 KB v6.0 files created and committed
- [x] 331 benchmark records added
- [x] Copilot Instructions v6.0 deployed to all 3 locations
- [x] All changes pushed to feature branch

## Merge to deploy/personal (Aragorn AI)

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Checkout deploy/personal
git checkout deploy/personal

# Pull latest
git pull origin deploy/personal

# Merge feature branch
git merge feature/v6.0-retrieval-enhancement -m "Merge MPA v6.0: KB restructuring, benchmark expansion, copilot instructions

CHANGES:
- 25 KB v6.0 files with META tags for hybrid retrieval
- 331 benchmark records across 14 verticals (up from 79)
- Copilot Instructions v6.0 with KB architecture references
- VS Code retrieval infrastructure (partial)

KB v6.0 CATEGORIES:
- Core Standards (1 file)
- Expert Guidance (4 files)
- Playbooks (1 file)
- Frameworks (5 files)
- Guides (3 files)
- Implications (5 files)
- Audience (2 files)
- Support (3 files)
- Index (1 file)

Total: 7,608 lines (~65% compression from v5.5)"

# Push
git push origin deploy/personal
```

## Merge to deploy/mastercard (Corporate)

```bash
# Checkout deploy/mastercard
git checkout deploy/mastercard

# Pull latest
git pull origin deploy/mastercard

# Merge feature branch
git merge feature/v6.0-retrieval-enhancement -m "Merge MPA v6.0: KB restructuring, benchmark expansion, copilot instructions

CHANGES:
- 25 KB v6.0 files with META tags for hybrid retrieval
- 331 benchmark records across 14 verticals (up from 79)
- Copilot Instructions v6.0 with KB architecture references
- VS Code retrieval infrastructure (partial)

KB v6.0 CATEGORIES:
- Core Standards (1 file)
- Expert Guidance (4 files)
- Playbooks (1 file)
- Frameworks (5 files)
- Guides (3 files)
- Implications (5 files)
- Audience (2 files)
- Support (3 files)
- Index (1 file)

Total: 7,608 lines (~65% compression from v5.5)"

# Push
git push origin deploy/mastercard
```

## Return to Feature Branch (Optional)

```bash
git checkout feature/v6.0-retrieval-enhancement
```

## One-Liner Version

```bash
# Deploy to personal
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform && git checkout deploy/personal && git pull && git merge feature/v6.0-retrieval-enhancement -m "Merge MPA v6.0" && git push

# Deploy to mastercard
git checkout deploy/mastercard && git pull && git merge feature/v6.0-retrieval-enhancement -m "Merge MPA v6.0" && git push

# Return to feature
git checkout feature/v6.0-retrieval-enhancement
```
