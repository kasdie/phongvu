$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$CatalogDir = Join-Path $Root "data\phongvu-catalog"
$ProductsJsonPath = Join-Path $CatalogDir "products.json"
$ProductsNdjsonPath = Join-Path $CatalogDir "products.ndjson"
$ProductUrlsPath = Join-Path $CatalogDir "product-urls.json"
$DemoProductsJsonPath = Join-Path $CatalogDir "demo-products.json"
$DemoByCategoryJsonPath = Join-Path $CatalogDir "demo-products-by-category.json"
$DemoSummaryPath = Join-Path $CatalogDir "demo-summary.json"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$CategoryNames = [ordered]@{
  "phu-kien-pc" = "Phụ kiện máy tính"
  "h-gaming-gear" = "Gaming Gear"
  "thiet-bi-van-phong" = "Thiết bị văn phòng"
  "phu-kien-chung" = "Phụ kiện"
  "laptop" = "Laptop"
  "san-pham-apple" = "Sản phẩm Apple"
  "man-hinh-may-tinh" = "Màn hình máy tính"
  "hang-thanh-ly" = "Hàng thanh lý"
  "giai-phap-doanh-nghiep" = "Giải pháp doanh nghiệp"
  "dien-may-dien-gia-dung" = "Điện máy - Điện gia dụng"
  "thiet-bi-am-thanh" = "Thiết bị âm thanh"
  "dien-thoai-may-tinh-bang-phu-kien" = "Điện thoại, Tablet, Phụ kiện"
  "linh-kien-may-tinh" = "Linh kiện máy tính"
  "may-tinh-de-ban" = "PC - Máy tính để bàn"
  "do-gia-dung" = "Đồ gia dụng"
}

function Read-JsonUtf8($Path) {
  $value = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
  if ($value -is [array] -and $value.Count -eq 1 -and $value[0] -is [array]) {
    return @($value[0])
  }
  return @($value)
}

function Write-JsonUtf8($Path, $Value) {
  $json = $Value | ConvertTo-Json -Depth 40
  [System.IO.File]::WriteAllText($Path, $json + [Environment]::NewLine, $Utf8NoBom)
}

function Normalize-Text($Text) {
  if ($null -eq $Text) { $value = "" } else { $value = [string]$Text }
  $formD = $value.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  $builder = New-Object Text.StringBuilder
  foreach ($char in $formD.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$builder.Append($char)
    }
  }
  return ($builder.ToString() -replace "đ", "d" -replace "[^a-z0-9\s.-]", " " -replace "\s+", " ").Trim()
}

function Clean-Text($Text) {
  if ($null -eq $Text) { return "" }
  return ([System.Net.WebUtility]::HtmlDecode([string]$Text) -replace "<[^>]+>", " " -replace "\s+", " ").Trim()
}

function Number-OrNull($Value) {
  if ($Value -is [array]) { $Value = $Value | Select-Object -First 1 }
  if ($null -eq $Value -or $Value -eq "") { return $null }
  $number = 0.0
  if ([double]::TryParse([string]$Value, [Globalization.NumberStyles]::Any, [Globalization.CultureInfo]::InvariantCulture, [ref]$number)) {
    return $number
  }
  if ([double]::TryParse([string]$Value, [Globalization.NumberStyles]::Any, [Globalization.CultureInfo]::CurrentCulture, [ref]$number)) {
    return $number
  }
  return $null
}

function Format-Vnd($Price) {
  $number = Number-OrNull $Price
  if ($null -eq $number) { return "" }
  return ("{0:N0} đ" -f $number).Replace(",", ".")
}

function Category-Name($Slug) {
  if ($CategoryNames.Contains($Slug)) { return $CategoryNames[$Slug] }
  return [string]$Slug
}

function As-Array($Value) {
  if ($null -eq $Value) { return @() }
  if ($Value -is [array]) { return @($Value) }
  return @($Value)
}

function Flatten-JsonLd($Value) {
  $items = @()
  foreach ($item in (As-Array $Value)) {
    if ($null -eq $item) { continue }
    if ($item.PSObject.Properties.Name -contains "@graph") {
      $items += Flatten-JsonLd $item."@graph"
    } else {
      $items += $item
    }
  }
  return $items
}

function Has-JsonLdType($Entry, $TypeName) {
  return @($Entry."@type") -contains $TypeName
}

function First-Value($Value) {
  return (As-Array $Value | Where-Object { $_ } | Select-Object -First 1)
}

function Unique-Values($Values) {
  $seen = @{}
  $result = @()
  foreach ($value in (As-Array $Values)) {
    if (-not $value) { continue }
    $key = [string]$value
    if (-not $seen.ContainsKey($key)) {
      $seen[$key] = $true
      $result += $key
    }
  }
  return $result
}

function Sku-FromUrl($Url) {
  $match = [regex]::Match([string]$Url, "--[sp](\d+)")
  if ($match.Success) { return $match.Groups[1].Value }
  return ""
}

function Slug-FromUrl($Url) {
  $path = ([Uri]$Url).AbsolutePath.Trim("/")
  return ($path -replace "--[sp]\d+$", "")
}

function Parse-ProductPage($Html, $SitemapEntry) {
  $jsonBlocks = [regex]::Matches(
    $Html,
    '<script\b[^>]*type=["'']application/ld\+json["''][^>]*>([\s\S]*?)</script>',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  $entries = @()
  foreach ($match in $jsonBlocks) {
    $raw = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value.Trim())
    if (-not $raw) { continue }
    try {
      $entries += Flatten-JsonLd ($raw | ConvertFrom-Json)
    } catch {
      continue
    }
  }

  $product = $entries | Where-Object { Has-JsonLdType $_ "Product" } | Select-Object -First 1
  if (-not $product) { throw "Product JSON-LD not found" }

  $offer = First-Value $product.offers
  $images = Unique-Values @($product.image) + (Unique-Values $SitemapEntry.sitemapImages)
  $specifications = @()
  foreach ($item in (As-Array $product.additionalProperty)) {
    if ($item.name) {
      $specifications += [pscustomobject]@{
        name = Clean-Text $item.name
        value = Clean-Text $item.value
      }
    }
  }

  $specificationMap = [ordered]@{}
  foreach ($spec in $specifications) {
    if ($spec.name) { $specificationMap[$spec.name] = $spec.value }
  }

  $availability = [string]$offer.availability
  if ($availability -match "/([^/]+)$") { $availability = $Matches[1] }
  $productUrl = if ($product.url) { [string]$product.url } else { [string]$SitemapEntry.url }
  $sku = if ($product.sku) { [string]$product.sku } else { Sku-FromUrl $SitemapEntry.url }
  $brand = if ($product.brand.name) { $product.brand.name } else { $product.brand }
  $priceCurrency = if ($offer.priceCurrency) { [string]$offer.priceCurrency } else { "VND" }

  return [pscustomobject][ordered]@{
    sourceUrl = [string]$SitemapEntry.url
    productUrl = $productUrl
    slug = Slug-FromUrl $SitemapEntry.url
    sku = $sku
    name = Clean-Text $product.name
    brand = Clean-Text $brand
    category = Clean-Text $product.category
    categorySlug = [string]$SitemapEntry.categorySlug
    categorySlugs = @($SitemapEntry.categorySlugs)
    description = Clean-Text $product.description
    price = Number-OrNull $offer.price
    priceCurrency = $priceCurrency
    availability = $availability
    itemCondition = [string]$offer.itemCondition
    image = First-Value $images
    images = $images
    breadcrumbs = @()
    specifications = $specifications
    specificationMap = $specificationMap
    sitemapLastmod = [string]$SitemapEntry.lastmod
    meta = [pscustomobject]@{}
    scrapedAt = (Get-Date).ToUniversalTime().ToString("o")
  }
}

function Fetch-Product($SitemapEntry) {
  $headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36"
    "Accept-Language" = "vi,en-US;q=0.8,en;q=0.6"
  }
  $response = Invoke-WebRequest -UseBasicParsing -Uri $SitemapEntry.url -Headers $headers -TimeoutSec 12
  Parse-ProductPage $response.Content $SitemapEntry
}

function Product-Name($Product) {
  Normalize-Text $Product.name
}

function Product-SearchText($Product) {
  Normalize-Text (($Product.sku, $Product.name, $Product.brand, $Product.categoryName, $Product.category, $Product.categorySlug, $Product.description, $Product.keySpecs, $Product.productUrl) -join " ")
}

function Product-Key($Product) {
  if ($Product.sku) { return [string]$Product.sku }
  return [string]$Product.sourceUrl
}

function Add-AvailableProduct($Product) {
  $key = Product-Key $Product
  if (-not $script:AvailableByKey.ContainsKey($key)) {
    $script:Available += $Product
    $script:AvailableByKey[$key] = $true
    $script:NewProducts += $Product
  }
}

function Ensure-Products($Name, [int]$TargetCount, [scriptblock]$ProductFilter, [scriptblock]$UrlFilter, [int]$MaxAttempts = 50) {
  $current = @($script:Available | Where-Object { & $ProductFilter $_ }).Count
  $attempts = 0
  if ($current -ge $TargetCount) {
    Write-Output "$Name already has $current products"
    return
  }

  $candidates = @($script:ProductUrls | Where-Object { & $UrlFilter $_ })
  foreach ($entry in $candidates) {
    if ($current -ge $TargetCount -or $attempts -ge $MaxAttempts) { break }
    if ($script:AvailableSourceUrls.ContainsKey([string]$entry.url)) { continue }

    $attempts += 1
    try {
      $product = Fetch-Product $entry
      $script:AvailableSourceUrls[[string]$product.sourceUrl] = $true
      Add-AvailableProduct $product
      if (& $ProductFilter $product) {
        $current += 1
        Write-Output "  fetched $Name $current/${TargetCount}: $($product.sku) $($product.name)"
      }
    } catch {
      Write-Output "  failed $($entry.url): $($_.Exception.Message)"
    }
  }

  Write-Output "$Name final count: $current"
}

function Select-PriceDiverse($Items, [int]$Count) {
  $byPrice = @($Items | Where-Object { $null -ne (Number-OrNull $_.price) -and (Number-OrNull $_.price) -gt 0 } | Sort-Object @{ Expression = { Number-OrNull $_.price } })
  if ($byPrice.Count -le $Count) { return $byPrice }

  $picked = @()
  $seen = @{}
  for ($i = 0; $i -lt $Count; $i += 1) {
    $index = [int][Math]::Round(($i * ($byPrice.Count - 1)) / [Math]::Max(1, ($Count - 1)))
    $candidate = $byPrice[$index]
    $key = Product-Key $candidate
    if (-not $seen.ContainsKey($key)) {
      $picked += $candidate
      $seen[$key] = $true
    }
  }

  foreach ($candidate in $byPrice) {
    if ($picked.Count -ge $Count) { break }
    $key = Product-Key $candidate
    if (-not $seen.ContainsKey($key)) {
      $picked += $candidate
      $seen[$key] = $true
    }
  }
  return $picked
}

function Demo-Product($Product, [string]$OverrideCategorySlug = "") {
  $slug = if ($OverrideCategorySlug) { $OverrideCategorySlug } else { [string]$Product.categorySlug }
  if (-not $OverrideCategorySlug -and (Product-Name $Product).Contains("macbook")) {
    $slug = "san-pham-apple"
  }
  $price = Number-OrNull $Product.price
  $specs = @($Product.specifications)
  $keySpecs = if ($specs.Count) {
    (($specs | Where-Object { $_.name -and $_.value } | Select-Object -First 8 | ForEach-Object { "$($_.name): $($_.value)" }) -join "; ")
  } else {
    [string]$Product.keySpecs
  }

  return [pscustomobject][ordered]@{
    categorySlug = $slug
    categoryName = Category-Name $slug
    priceBand = ""
    sku = [string]$Product.sku
    name = [string]$Product.name
    brand = [string]$Product.brand
    category = [string]$Product.category
    price = $price
    priceFormatted = Format-Vnd $price
    availability = [string]$Product.availability
    description = [string]$Product.description
    image = [string]$Product.image
    productUrl = [string]$Product.productUrl
    sourceUrl = [string]$Product.sourceUrl
    keySpecs = $keySpecs
    specifications = $specs
    specificationMap = $Product.specificationMap
    scrapedAt = [string]$Product.scrapedAt
  }
}

function Add-DemoProducts($Items, [string]$OverrideCategorySlug = "") {
  foreach ($product in @($Items)) {
    if ($null -eq $product -or -not $product.sku -or -not $product.name) { continue }
    $key = Product-Key $product
    if ($OverrideCategorySlug) { $key = "$OverrideCategorySlug::$key" }
    if (-not $script:DemoByKey.ContainsKey($key)) {
      $script:Demo += (Demo-Product $product $OverrideCategorySlug)
      $script:DemoByKey[$key] = $true
    }
  }
}

$Available = @(Read-JsonUtf8 $ProductsJsonPath)
$ProductUrls = @(Read-JsonUtf8 $ProductUrlsPath)
$AvailableByKey = @{}
$AvailableSourceUrls = @{}
$NewProducts = @()

foreach ($product in $Available) {
  $AvailableByKey[(Product-Key $product)] = $true
  if ($product.sourceUrl) { $AvailableSourceUrls[[string]$product.sourceUrl] = $true }
}

$filters = @{
  macbook = { param($p) (Product-Name $p).Contains("macbook") -and (Number-OrNull $p.price) -ge 10000000 }
  mouse = { param($p) $n = Product-Name $p; ($n.Contains("chuot") -or $n.Contains("mouse")) -and -not ($n.Contains("lot chuot") -or $n.Contains("mousepad") -or $n.Contains("mouse mat") -or $n.Contains("tam lot") -or $n.Contains("mieng lot") -or $n.Contains("ban phim")) }
  keyboard = { param($p) $n = Product-Name $p; $n.Contains("ban phim") -or $n.Contains("keyboard") }
  headset = { param($p) $n = Product-Name $p; ($n.Contains("tai nghe") -or $n.Contains("headphone") -or $n.Contains("headset")) -and -not $n.Contains("gia de") }
  desktop = { param($p) $p.categorySlug -eq "may-tinh-de-ban" }
  laptop = { param($p) $p.categorySlug -eq "laptop" }
  monitor = { param($p) $p.categorySlug -eq "man-hinh-may-tinh" }
  ram = { param($p) $n = Product-Name $p; $p.categorySlug -eq "linh-kien-may-tinh" -and $n.Contains("ram") }
  storage = { param($p) $n = Product-Name $p; @("linh-kien-may-tinh", "phu-kien-chung") -contains $p.categorySlug -and ($n.Contains("ssd") -or $n.Contains("hdd") -or $n.Contains("o cung")) }
  vga = { param($p) $n = Product-Name $p; $p.categorySlug -eq "linh-kien-may-tinh" -and ($n.Contains("vga") -or $n.Contains("card man hinh") -or $n.Contains("geforce") -or $n.Contains("radeon")) }
  cpu = { param($p) $n = Product-Name $p; $p.categorySlug -eq "linh-kien-may-tinh" -and ($n.Contains("cpu") -or $n.Contains("bo vi xu ly") -or $n.Contains("processor")) }
  printer = {
    param($p)
    $n = Product-Name $p
    $p.categorySlug -eq "thiet-bi-van-phong" -and
      ($n.Contains("may in") -or $n.Contains("printer")) -and
      -not ($n.Contains("cap usb") -or $n.Contains("cap may in") -or $n.Contains("muc in") -or $n.Contains("drum") -or $n.Contains("hop muc"))
  }
}

Ensure-Products "macbook" 10 $filters.macbook { param($u) (Normalize-Text $u.url).Contains("macbook") } 30
Ensure-Products "printer" 10 $filters.printer { param($u) $hay = Normalize-Text $u.url; $u.categorySlug -eq "thiet-bi-van-phong" -and ($hay.Contains("may-in") -or $hay.Contains("printer")) -and -not $hay.Contains("cap-") } 90
Ensure-Products "gaming gear" 10 { param($p) $p.categorySlug -eq "h-gaming-gear" } { param($u) $u.categorySlug -eq "h-gaming-gear" } 20
Ensure-Products "clearance" 10 { param($p) $p.categorySlug -eq "hang-thanh-ly" } { param($u) $u.categorySlug -eq "hang-thanh-ly" } 20
Ensure-Products "ram" 10 $filters.ram { param($u) $u.categorySlug -eq "linh-kien-may-tinh" -and (Normalize-Text $u.url).Contains("ram") } 50
Ensure-Products "cpu" 10 $filters.cpu { param($u) $u.categorySlug -eq "linh-kien-may-tinh" -and ((Normalize-Text $u.url).Contains("cpu") -or (Normalize-Text $u.url).Contains("bo-vi-xu-ly") -or (Normalize-Text $u.url).Contains("processor")) } 50

if ($NewProducts.Count -gt 0) {
  $ndjson = ($NewProducts | ForEach-Object { $_ | ConvertTo-Json -Depth 40 -Compress }) -join [Environment]::NewLine
  [System.IO.File]::AppendAllText($ProductsNdjsonPath, [Environment]::NewLine + $ndjson + [Environment]::NewLine, $Utf8NoBom)
}

$Available = @($Available | Sort-Object @{ Expression = { if ($_.sku) { [string]$_.sku } else { [string]$_.sourceUrl } } })
Write-JsonUtf8 $ProductsJsonPath $Available

$Demo = @()
$DemoByKey = @{}
foreach ($slug in $CategoryNames.Keys) {
  Add-DemoProducts (Select-PriceDiverse (@($Available | Where-Object { $_.categorySlug -eq $slug })) 10)
}

$gamingFallbackProducts = @($Available | Where-Object {
  $hay = Product-SearchText $_
  ($_.categorySlug -in @("phu-kien-pc", "thiet-bi-am-thanh", "phu-kien-chung")) -and
    ($hay.Contains("gaming") -or $hay.Contains("razer") -or $hay.Contains("rog") -or $hay.Contains("chuot gaming") -or $hay.Contains("ban phim gaming") -or $hay.Contains("tai nghe gaming"))
})
Add-DemoProducts (Select-PriceDiverse $gamingFallbackProducts 10) "h-gaming-gear"

$targets = @(
  @{ name = "macbook"; filter = $filters.macbook },
  @{ name = "mouse"; filter = $filters.mouse },
  @{ name = "keyboard"; filter = $filters.keyboard },
  @{ name = "headset"; filter = $filters.headset },
  @{ name = "desktop"; filter = $filters.desktop },
  @{ name = "laptop"; filter = $filters.laptop },
  @{ name = "monitor"; filter = $filters.monitor },
  @{ name = "ram"; filter = $filters.ram },
  @{ name = "storage"; filter = $filters.storage },
  @{ name = "vga"; filter = $filters.vga },
  @{ name = "cpu"; filter = $filters.cpu },
  @{ name = "printer"; filter = $filters.printer }
)

foreach ($target in $targets) {
  Add-DemoProducts (Select-PriceDiverse (@($Available | Where-Object { & $target.filter $_ })) 10)
}

$Demo = @($Demo | Sort-Object categorySlug, @{ Expression = { $price = Number-OrNull $_.price; if ($null -ne $price) { $price } else { [double]::MaxValue } } }, name)
foreach ($group in ($Demo | Group-Object categorySlug)) {
  $items = @($group.Group | Sort-Object @{ Expression = { $price = Number-OrNull $_.price; if ($null -ne $price) { $price } else { [double]::MaxValue } } })
  for ($index = 0; $index -lt $items.Count; $index += 1) {
    $ratio = if ($items.Count -le 1) { 0 } else { $index / ($items.Count - 1) }
    $items[$index].priceBand = if ($ratio -lt 0.34) { "giá thấp" } elseif ($ratio -lt 0.67) { "giá tầm trung" } else { "giá cao" }
  }
}

$productsByCategory = [ordered]@{}
foreach ($group in ($Demo | Group-Object categorySlug | Sort-Object Name)) {
  $productsByCategory[$group.Name] = [pscustomobject][ordered]@{
    categoryName = Category-Name $group.Name
    products = @($group.Group)
  }
}

$summary = @($Demo | Group-Object categorySlug | Sort-Object Name | ForEach-Object {
  $prices = @($_.Group | ForEach-Object { Number-OrNull $_.price } | Where-Object { $null -ne $_ })
  [pscustomobject][ordered]@{
    categorySlug = $_.Name
    categoryName = Category-Name $_.Name
    selectedCount = $_.Count
    minPrice = if ($prices.Count) { [double]($prices | Measure-Object -Minimum).Minimum } else { $null }
    maxPrice = if ($prices.Count) { [double]($prices | Measure-Object -Maximum).Maximum } else { $null }
    status = if ($_.Count -ge 10) { "ok" } else { "partial" }
  }
})

Write-JsonUtf8 $DemoProductsJsonPath $Demo
Write-JsonUtf8 $DemoByCategoryJsonPath $productsByCategory
Write-JsonUtf8 $DemoSummaryPath $summary

Write-Output "Available products: $($Available.Count)"
Write-Output "Newly fetched products: $($NewProducts.Count)"
Write-Output "Demo products: $($Demo.Count)"
foreach ($target in $targets) {
  $count = @($Demo | Where-Object { & $target.filter $_ }).Count
  Write-Output "Target $($target.name): $count"
}
foreach ($item in $summary) {
  Write-Output "Category $($item.categorySlug): $($item.selectedCount)"
}
