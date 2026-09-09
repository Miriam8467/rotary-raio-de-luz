# ========================================
# BACKUP DO BANCO - ROTARY RAIO DE LUZ
# ========================================

$Data = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

$PastaBackup = Join-Path $PSScriptRoot "backups"

$ArquivoBackup = Join-Path `
    $PastaBackup `
    "rotary_raio_luz_$Data.backup"

$PgDump = "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe"

if (!(Test-Path $PastaBackup)) {
    New-Item -ItemType Directory -Path $PastaBackup | Out-Null
}

Write-Host "========================================"
Write-Host " BACKUP - ROTARY RAIO DE LUZ"
Write-Host "========================================"
Write-Host ""

Write-Host "Iniciando backup do banco..."
Write-Host ""

& $PgDump `
    -h localhost `
    -p 5432 `
    -U postgres `
    -F c `
    -b `
    -v `
    -f $ArquivoBackup `
    rotary_raio_luz

if ($LASTEXITCODE -eq 0) {

    Write-Host ""
    Write-Host "Backup realizado com sucesso!"
    Write-Host ""
    Write-Host "Arquivo:"
    Write-Host $ArquivoBackup
    Write-Host ""

} else {

    Write-Host ""
    Write-Host "ERRO ao realizar o backup."
    Write-Host ""
}

Write-Host "Pressione qualquer tecla para fechar."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null