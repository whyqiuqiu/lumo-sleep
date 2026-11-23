$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'native')
node node_modules/expo/bin/cli start --web --port 8081
