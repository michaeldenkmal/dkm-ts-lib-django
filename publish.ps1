$ErrorActionPreference = "Stop"

function pause($msg) {
    Read-Host "$msg (Strg-c für Abbruch)"
}

function compile_ts() {
    .\compile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Fehler beim Kompilieren!"
        exit $proc.ExitCode
    }
}

function remove-folder-if-exists($folder) {
    $fp = Join-Path -Path $PSScriptRoot -ChildPath $folder
    if (Test-Path -Path $fp) {
        Remove-Item -Recurse -Force $fp
    }
}

remove-folder-if-exists --folder "lib"
#pause "Ist Ein Fehler aufgetreten?, wenn ha dann hier abbrechen"
#npx tsc -p tsconfig.json
compile_ts
Write-Host "✅ Kompilierung erfolgreich."
# überprüfen ob kompilierung erfolgreich
#pause "Ist Ein Fehler aufgetreten?, wenn ha dann hier abbrechen"
robocopy src lib *.css /S
robocopy src lib *.png /S
robocopy src lib *.js /S

# jetzt den lib/test/ ordner löschen
#Remove-Item -Recurse -Force lib\test
remove-folder-if-exists --folder "lib\text"
# den inhalt von lib/src order verschieben
#Move-Item -Path "lib\src\*" -Destination "lib"
# vRemove-Item -Recurse -Force lib\src
remove-folder-if-exists "lib\src"

Start-Process "git" -ArgumentList "gui" -Wait

npm version patch
Pause "Wirklich Publischen?"
npm publish
