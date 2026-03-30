$source = "C:\Users\GVarg\.gemini\antigravity\brain\0687416c-92c3-442a-b92b-d717f3e7a5b7"
$target = "f:\CLIENTES\IMBRA-MAPACHE\Imbra Store\public\categories"

if (!(Test-Path $target)) { New-Item -ItemType Directory -Path $target }

$mapping = @{
    "asiento_3d_png_1774730866180.png" = "asientos.png"
    "carburacion_new_3d_1774731506430.png" = "carburacion.png"
    "carroceria_3d_png_1774730849389.png" = "chasis_3d.png"
    "escape_3d_png_1774730823163.png" = "escape.png"
    "fijacion_new_3d_1774731518604.png" = "fijacion.png"
    "iluminacion_3d_png_1774730786805.png" = "iluminacion.png"
    "suspension_kits_3d_1774731531638.png" = "suspension.png"
    "lubricacion_3d_png_1774730881740.png" = "filtros.png"
    "ruedas_3d_png_1774730834914.png" = "wheels_tires.png"
    "transmision_new_3d_1774731489400.png" = "transmision.png"
    "motor_3d_new_1774732403346.png" = "motor.png"
    "frenos_3d_new_1774732415665.png" = "frenos.png"
    "electricos_3d_new_1774732429608.png" = "electricos.png"
    "kits_3d_png_1774730911907.png" = "kits.png"
}

Write-Host "--- Sincronización de Imágenes IMBRA ---" -ForegroundColor Cyan

foreach ($item in $mapping.GetEnumerator()) {
    $srcFile = Join-Path $source $item.Key
    $destFile = Join-Path $target $item.Value
    if (Test-Path $srcFile) {
        Copy-Item -Path $srcFile -Destination $destFile -Force
        Write-Host "✅ Copiado: $($item.Value)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No encontrado: $($item.Key) (Pendiente)" -ForegroundColor Yellow
    }
}

Write-Host "`nSincronización finalizada. Revisa /categorias" -ForegroundColor Cyan
