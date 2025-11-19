# 1. ruf tsc auf und sammle sowohl stdout als auch stderr
#    stderr wird mit 2>&1 auf stdout umgeleitet
$output = npx tsc -p tsconfig.build.json 2>&1

$hadRealError = $false

foreach ($line in $output) {
    # Wenn die Zeile einen Pfad aus node_modules enthält,
    # dann ignorieren wir sie einfach
    if ($line -match "node_modules") {
        continue
    }

    # Alles andere zeigen wir an
    Write-Host $line

    # Und wenn es so aussieht wie eine echte TS-Fehlermeldung aus unserem Code,
    # merken wir uns, dass wirklich ein Fehler passiert ist
    if ($line -match "error TS\d+:") {
        $hadRealError = $true
    }
}

# Exit-Code setzen:
# wenn wir keine echten Fehler außerhalb node_modules gesehen haben, exit 0
if ($hadRealError) {
    Write-Host "Fehler beim Compile"
    exit 1
} else {
    Write-Host "KEIN Fehler beim Compile"
    exit 0
}
