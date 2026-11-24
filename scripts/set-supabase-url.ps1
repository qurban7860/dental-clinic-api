$ErrorActionPreference = "Stop"

$secureUrl = Read-Host "Paste the ROTATED Supabase PostgreSQL session-pooler URL (input is hidden)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureUrl)

try {
    $connectionString = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ($connectionString -notmatch '^postgres(ql)?://') {
    throw "Expected a PostgreSQL connection URL."
}

try {
    $connectionUri = [Uri]$connectionString
}
catch {
    throw "The connection URL is invalid. Percent-encode reserved password characters (for example, @ as %40)."
}

if (-not ($connectionUri.Host.EndsWith(".supabase.com") -or $connectionUri.Host.EndsWith(".supabase.co"))) {
    throw "The URL host does not appear to be a Supabase PostgreSQL host."
}

if ($connectionUri.Port -ne 5432) {
    throw "Use the Supabase direct or session-pooler endpoint on port 5432 for Prisma migrations; transaction pooler port 6543 cannot run migrations."
}

if ($connectionUri.Query -notmatch '(^|[&?])sslmode=') {
    if ($connectionString.Contains("?")) {
        $connectionString += "&sslmode=require"
    }
    else {
        $connectionString += "?sslmode=require"
    }
}

$envPath = Join-Path $PSScriptRoot "..\.env"
$envPath = [IO.Path]::GetFullPath($envPath)
$lines = @()
if (Test-Path $envPath) {
    $lines = @(Get-Content -Path $envPath | Where-Object { $_ -notmatch '^\s*DATABASE_URL\s*=' })
}
$lines += "DATABASE_URL=$connectionString"
[IO.File]::WriteAllLines($envPath, $lines, (New-Object System.Text.UTF8Encoding($false)))

$connectionString = $null
$secureUrl.Dispose()
Write-Host "Supabase DATABASE_URL saved in server/.env (ignored by Git). The URL was not printed."
