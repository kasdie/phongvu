const slider = document.querySelector(".main-slider");
const slideImages = [...document.querySelectorAll("[data-slide-image]")];
const dots = [...document.querySelectorAll(".slider-dots button")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const slides = [
  {
    src: "assets/images/banners/unnamed (3).webp",
    alt: "Bớt giá đầy deal 29 năm",
  },
  {
    src: "assets/images/banners/unnamed (6).webp",
    alt: "Sắm Laptop Acer Gaming nhận ngay Giftcode",
  },
  {
    src: "assets/images/banners/unnamed (4).webp",
    alt: "MacBook Neo giá bất ngờ",
  },
  {
    src: "assets/images/banners/unnamed (5).webp",
    alt: "MSI Frames Win Games",
  },
  {
    src: "assets/images/banners/unnamed.webp",
    alt: "Lenovo sập deal",
  },
  {
    src: "assets/images/banners/unnamed (1).webp",
    alt: "Màn deal chuẩn VAR chuẩn nét",
  },
];

const categoryMenus = {
  laptop: [
    ["Thương hiệu", "Apple (Macbook)", "Acer", "ASUS", "Dell", "HP", "Lenovo", "LG Gram", "MSI", "Gigabyte"],
    ["Nhu cầu", "Laptop Văn Phòng", "Laptop Gaming", "Laptop đồ họa", "Laptop Sinh viên", "Laptop cảm ứng 2 in 1", "Laptop mỏng nhẹ", "Laptop Doanh nhân"],
    ["Cấu hình", "Laptop i5", "Laptop i7", "Laptop i9", "Laptop Ryzen 5", "Laptop Ryzen 7", "Laptop Ultra 5", "Laptop Ultra 7", "Laptop Ultra 9"],
    ["Laptop Lenovo", "Lenovo Legion", "Lenovo LOQ", "Lenovo IdeaPad", "Lenovo ThinkBook", "Lenovo ThinkPad", "Lenovo Yoga"],
    ["Laptop ASUS", "ASUS TUF Gaming", "ASUS ROG Gaming", "ASUS Vivobook", "ASUS Zenbook", "Asus ExpertBook"],
    ["Laptop Acer", "Acer Predator", "Acer Nitro", "Acer Swift", "Acer Aspire"],
    ["Laptop Dell", "Dell Inspiron", "Dell Pro", "Dell series", "Dell Latitude"],
    ["Laptop MSI", "MSI Stealth", "MSI Katana", "MSI Cyborg", "MSI Modern", "MSI Prestige"],
    ["Laptop HP", "HP OmniBook", "HP Omen", "HP Victus", "HP Probook", "HP Envy"],
    ["Laptop Hi-End", "RTX 5000 series", "Core Ultra 300 Series", "Ryzen AI 400 series"],
  ],
  apple: [
    ["Mac", "MacBook Neo", "Macbook Air", "MacBook Pro", "iMac", "Mac mini", "Mac Studio"],
    ["iPhone", "iPhone 17 series", "iPhone 16 series", "iPhone 15 series"],
    ["iPad", "iPad Pro", "iPad Air", "iPad Mini", "iPad Gen Series"],
    ["Phụ kiện Apple", "Apple Watch", "Củ sạc & Cáp sạc", "Tai nghe Apple", "Bàn phím, chuột & bút", "Apple TV", "Airtag"],
  ],
  appliance: [
    ["Tivi", "Theo thương hiệu", "Samsung", "LG", "Xiaomi", "Sony", "TCL", "Coocaa", "Theo tính năng", "Tivi 4K", "Tivi 8K", "Tivi OLED", "Tivi QLED", "Android Tivi"],
    ["Máy giặt", "Samsung", "LG", "Toshiba", "Electrolux", "AQUA", "Galanz", "Sharp", "Panasonic", "Máy giặt cửa trước", "Máy giặt cửa trên", "Máy sấy quần áo"],
    ["Điều hòa - Máy lạnh", "Panasonic", "Daikin", "Toshiba", "LG", "Samsung", "Sharp", "Casper", "Nagakawa", "Máy lạnh Inverter", "Công suất 1 HP", "Công suất 1.5 HP", "Công suất 2 HP"],
    ["Tủ lạnh", "Samsung", "Toshiba", "LG", "Sharp", "AQUA", "Hitachi", "Tủ lạnh Side-by-Side", "Tủ lạnh ngăn đá trên", "Tủ lạnh ngăn đá dưới", "Tủ lạnh Inverter", "Tủ rượu"],
    ["Máy nước nóng", "Ariston", "Panasonic", "Máy nước nóng trực tiếp", "Máy nước nóng gián tiếp"],
  ],
  home: [
    ["Gia dụng nhà bếp", "Bếp điện từ", "Bếp hồng ngoại", "Bình thủy điện", "Lò nướng", "Lò vi sóng", "Nồi cơm điện", "Nồi áp suất", "Nồi chiên không dầu", "Bình đun", "Nồi hấp thực phẩm"],
    ["Máy chế biến", "Máy xay thực phẩm", "Máy xay sinh tố", "Máy xay thịt", "Máy ép chậm", "Máy ép trái cây", "Máy vắt cam", "Máy pha cà phê", "Máy xay cà phê", "Máy rửa chén bát", "Máy đánh trứng", "Máy nhồi bột"],
    ["Chăm sóc nhà cửa", "Máy lọc không khí", "Máy tạo ẩm", "Máy hút ẩm", "Máy hút mùi", "Máy hút bụi", "Robot hút bụi", "Quạt", "Quạt điều hòa", "Máy lọc nước", "Cây nước nóng lạnh", "Bàn ủi"],
    ["Làm đẹp", "Máy rửa mặt", "Máy tăm nước", "Bàn chải điện", "Máy triệt lông", "Máy sấy tóc", "Máy đẩy tinh chất", "Máy massage"],
    ["Gia dụng không điện", "Nồi", "Chảo", "Hộp đựng thức ăn", "Bình giữ nhiệt"],
  ],
  pc: [
    ["Theo cấu hình VGA", "RTX 5000 series", "RTX 5090", "RTX 5080", "RTX 5070 | 5070 Ti", "RTX 5060 | 5060 Ti", "RTX 5050", "RTX 3060", "RTX 3050"],
    ["Nhu cầu", "PC AI", "PC Gaming", "PC văn phòng", "PC đồ họa", "PC All-In-One", "PC Mini", "Build PC"],
    ["Thương hiệu", "PC lắp ráp", "ASUS", "Dell", "HP", "Lenovo", "MSI"],
    ["Theo cấu hình CPU Intel", "PC Intel Core Ultra 200S", "PC i9", "PC i7", "PC i5", "PC i3"],
    ["Theo cấu hình CPU AMD", "PC Ryzen 5", "PC Ryzen 7"],
    ["Phân khúc giá", "10 triệu", "15 triệu", "20 triệu", "30 triệu"],
    ["KM mua 1 được 4", "Home Office I50177", "Home Office A50175", "Home Office I50168"],
  ],
  monitor: [
    ["Theo thương hiệu", "ASUS", "Acer", "AOC", "Dell", "HP", "Lenovo", "LG", "MSI", "Philips", "Viewsonic", "Samsung", "Xiaomi"],
    ["Tần số quét", "60Hz", "75Hz", "100Hz", "120Hz", "144Hz", "165Hz", "170Hz", "180Hz", "200Hz", "240Hz"],
    ["Theo kích cỡ", "Dưới 19 inch", "22 inch", "24 inch", "27 inch", "32 inch", "34 inch", "32 inch trở lên"],
    ["Theo nhu cầu", "Màn hình Gaming", "Màn hình đồ họa", "Màn hình văn phòng", "Màn hình cong", "Màn hình OLED", "Màn hình máy tính có cổng USB Type-C"],
    ["Theo giá", "Dưới 3 triệu", "3 đến 5 triệu", "5 đến 10 triệu", "10 đến 15 triệu", "15 đến 20 triệu", "Trên 20 triệu"],
    ["Độ phân giải", "HD", "Full HD", "2K - QHD", "4K UHD"],
  ],
  components: [
    ["Ổ cứng", "Ổ cứng SSD", "Ổ cứng HDD", "Ổ cứng di động", "WD", "Seagate", "Kingston", "Transcend", "Samsung", "Sandisk", "Lexar", "Crucial", "Lacie", "Adata", "MSI", "GIGABYTE", "Kioxia"],
    ["CPU - Bộ vi xử lý", "CPU Intel", "CPU Intel Core Ultra", "Intel Core Ultra 5", "Intel Core Ultra 7", "Intel Core Ultra 9", "Intel thế hệ 12", "Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "CPU AMD", "CPU AMD Ryzen", "AMD 9000 series", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"],
    ["Case - Thùng máy tính", "ASUS", "SAMA", "XIGMATEK", "Golden Field", "Deepcool", "Cooler Master", "Aerocool", "MSI", "CORSAIR", "ANTEC", "Cougar", "DELUXE", "EROS", "GIGABYTE", "MIK", "SEGOTEP", "NZXT"],
    ["RAM", "RAM Laptop", "RAM PC", "Ram 8GB", "Ram 16GB", "Ram 32GB", "Kingston", "Gigabyte", "KINGMAX", "G.SKILL", "CORSAIR", "Adata", "Apacer", "Lexar", "TEAM"],
    ["PSU - Nguồn máy tính", "ASUS", "Cooler Master", "Golden Field", "CORSAIR", "Gigabyte", "AcBel", "MSI", "SEGOTEP", "XIGMATEK", "ANTEC", "DEEPCOOL", "MIK SPOWER"],
    ["VGA - Card màn hình", "RTX 5000 series", "RTX 5090", "RTX 5080", "RTX 5070", "RTX 5070 Ti", "RTX 5060", "RTX 5060 Ti", "RTX 5050", "RTX 4060", "RTX 3060"],
    ["Mainboard - Bo mạch chủ", "Mainboard B860", "Mainboard B840", "Mainboard B760", "Mainboard Z890", "Mainboard Z790", "Mainboard X870", "Mainboard X670", "Mainboard B650"],
    ["Tản nhiệt PC", "Tản nhiệt khí", "Tản nhiệt nước"],
  ],
  "computer-accessories": [
    ["Chuột máy tính", "ASUS", "Logitech", "Corsair", "Razer", "SteelSeries", "HyperX", "AKKO", "Fuhlen", "MSI", "Dell", "Newmen", "DareU", "Microsoft", "E-dra", "Rapoo", "Xiaomi", "Mad Catz"],
    ["Bàn phím", "Asus", "Logitech", "Rapoo", "Microsoft", "Razer", "Corsair", "HyperX", "Aula", "Newmen", "DareU", "AKKO", "Fuhlen", "Dell", "Steelseries", "E-dra", "MSI"],
    ["Lót chuột", "Asus", "Logitech", "Corsair", "Razer", "SteelSeries", "AKKO", "MSI", "Newmen", "HyperX"],
    ["Webcam", "Logitech"],
    ["Ghế gaming", "Asus", "Corsair", "Drift Gaming", "E-Dra", "MSI", "Warrior", "AKRacing", "Cougar", "Razer", "SIHOO", "Khác"],
  ],
  gaming: [
    ["Tay cầm chơi game", "PlayStation", "Xbox", "Logitech", "Backbone", "Rapoo", "MSI", "E-dra", "Khác", "Madcatz", "Turtle Beach"],
    ["Chuột Gaming", "ASUS", "Logitech", "CORSAIR", "Razer", "SteelSeries", "Zowie", "HyperX", "Khác"],
    ["Bàn phím Gaming", "ASUS", "Logitech", "CORSAIR", "Razer", "SteelSeries", "AKKO", "HyperX", "Aula"],
    ["Tai nghe Gaming", "ASUS", "Logitech", "CORSAIR", "Razer", "SteelSeries", "HyperX", "Khác", "DareU"],
    ["Ghế Gaming", "Corsair", "DXRacer", "E-Dra", "MSI", "Warrior", "Khác"],
    ["Thiết bị Livestream", "Webcam", "Microphone", "Soundcard - Bộ trộn âm thanh"],
    ["Bàn Gaming", "Bàn gaming E-Dra", "Bàn gaming Warrior"],
    ["Máy chơi game", "PlayStation", "Máy chơi Game cầm tay"],
    ["Lót chuột - Bàn di chuột", "Logitech", "CORSAIR", "Razer", "SteelSeries", "AKKO"],
  ],
  mobile: [
    ["Đồng hồ thông minh", "Apple Watch", "Samsung Galaxy Watch", "Riversong", "Kospet", "Kieslect", "Xiaomi"],
    ["Phụ kiện điện thoại", "Kính cường lực", "Ốp lưng", "Ví", "Dây đeo", "Vòng giữ điện thoại", "Đế sạc"],
    ["Máy tính bảng", "iPad", "Samsung", "Xiaomi", "Lenovo", "Honor"],
    ["Phụ kiện máy tính bảng", "Kính cường lực", "Bao da - Ốp lưng", "Bàn phím", "Bút cảm ứng", "Miếng dán Canvas"],
    ["Điện thoại", "iPhone", "Samsung", "Xiaomi", "Honor"],
    ["Thiết bị đeo", "Xiaomi", "9Fit"],
    ["Phụ kiện đồng hồ", "Kính cường lực", "Ốp bảo vệ", "Dây đeo"],
  ],
  accessories: [
    ["Phụ kiện laptop", "Giá đỡ", "Đế tản nhiệt", "Balo - túi chống sốc", "Ốp lưng", "Dán màn hình", "Miếng lót bàn phím"],
    ["Linh kiện laptop", "Bàn phím laptop", "Sạc laptop", "Pin laptop", "RAM laptop"],
    ["Phụ kiện điện thoại", "Pin dự phòng", "Cáp sạc", "Cục sạc", "Giá đỡ"],
    ["Lưu trữ - Chuyển đổi", "Hub", "Cáp chuyển - cáp nối", "USB", "Đầu chuyển", "Đầu đọc thẻ nhớ", "Thẻ nhớ", "Ổ cứng gắn ngoài"],
    ["Phụ kiện khác", "Máy ảnh", "Máy ghi âm", "Máy quay phim", "Camera hành trình", "Gimbal"],
  ],
  audio: [
    ["Tai nghe", "Asus", "Apple", "Sony", "Logitech", "Razer", "HyperX", "Zidli", "DareU", "Steelseries", "Soundpeats", "E-dra", "CORSAIR", "HAVIT", "Xiaomi", "Sennheiser"],
    ["Loa nghe nhạc", "Bose", "Harman Kardon", "JBL", "Logitech", "Microlab", "Sony", "SoundMax", "LG", "Samsung", "Edifier", "Microtek", "Sounarc"],
    ["MicroPhone", "SARAMONIC", "SALAR", "AKG", "HYPERX", "SENIC", "RAZER", "BOYA"],
    ["Loại tai nghe", "In-Ear", "On-Ear", "Over-Ear", "Tai nghe Bluetooth", "Tai nghe Gaming", "Tai nghe không dây"],
    ["Các loại loa", "Loa vi tính", "Loa Soundbar", "Loa Mini", "Loa Bluetooth", "Loa kéo"],
    ["Soundcard"],
  ],
  office: [
    ["Thiết bị mạng", "ASUS", "TP-Link", "TOTOLINK", "D-Link", "Tenda", "Linksys", "DrayTek", "Cisco", "Router WiFi 6", "Router WiFi", "WiFi Mesh", "Hub - Switch", "USB WiFi", "USB 3G/4G", "Card mạng", "Cáp mạng"],
    ["Camera an ninh", "KBVISION", "HIKVISION", "QUESTEK", "EZVIZ", "TPLink", "Xiaomi", "Camera an ninh", "Camera WiFi", "Đầu ghi hình"],
    ["Máy in văn phòng", "Brother", "Canon", "Epson", "HP", "Máy in Laser", "Máy in kim", "Máy in phun", "Máy in đa năng"],
    ["Thiết bị khác", "Máy quét mã vạch", "Máy đếm tiền", "Máy chấm công", "Máy tính tiền", "Máy hủy tài liệu", "Máy ép nhựa"],
    ["Máy Scan", "Brother", "Canon", "Epson", "HP"],
    ["Mực in - Giấy in", "Mực in Laser", "Mực in phun", "Drum", "Ruy băng", "Giấy in"],
    ["Phần mềm", "Windows", "Microsoft Office", "Microsoft CSP", "Diệt Virus"],
    ["Máy Fax", "Panasonic", "Brother"],
  ],
  business: [
    ["Thiết bị doanh nghiệp", "Laptop", "Máy tính để bàn", "Máy chủ - Server", "Ổ cứng mạng - NAS", "Phần mềm", "Máy chiếu"],
    ["Thiết bị mạng", "Switch"],
    ["Thiết bị hội nghị", "Hội nghị truyền hình", "Camera hội nghị", "Micro hội nghị", "Loa hội nghị", "Phần mềm hội nghị", "Phụ kiện hội nghị"],
    ["Smart POS", "POS cầm tay"],
  ],
  clearance: [
    ["Màn hình cũ", "Màn hình LG cũ", "Màn hình Acer cũ", "Màn hình Asus cũ", "Màn hình Samsung cũ", "Màn hình MSI cũ", "Màn hình Dell cũ", "Màn hình Lenovo cũ", "Màn hình ViewSonic cũ", "Màn hình Philips cũ", "Màn hình HP cũ", "Màn hình Gigabyte cũ", "Màn hình AOC cũ", "Màn hình LC-Power cũ", "Màn hình Xiaomi cũ"],
    ["Laptop cũ", "Acer cũ", "ASUS cũ", "HP cũ", "Dell cũ", "Lenovo cũ", "LG cũ", "MSI cũ", "Gigabyte cũ"],
    ["Linh kiện máy tính cũ", "CPU cũ", "Card màn hình cũ", "Mainboard cũ", "RAM cũ", "Ổ cứng cũ", "PSU cũ", "Tản nhiệt cũ", "CASE cũ"],
    ["Điện máy & Gia dụng cũ", "Gia dụng nhà bếp cũ", "Tivi cũ", "Máy giặt, sấy cũ", "Tủ lạnh, tủ đông, tủ mát, tủ rượu cũ", "Quạt, thiết bị làm mát cũ", "Thiết bị làm đẹp, chăm sóc cá nhân cũ", "Máy hút bụi, robot hút bụi cũ"],
    ["Gear cũ", "Chuột cũ", "Bàn phím cũ", "Tai nghe cũ", "Bàn ghế cũ", "Lót chuột cũ", "Thiết bị giải trí và kỹ thuật số cũ"],
    ["Máy in cũ", "Brother cũ", "HP cũ", "Canon cũ", "Epson cũ"],
    ["Phụ kiện cũ", "Thiết bị Livestream cũ", "Thiết bị lưu trữ cũ", "Thiết bị sạc, pin cũ"],
    ["Sản phẩm Apple cũ", "MacBook cũ", "iPhone cũ", "iPad cũ", "Apple Watch cũ", "Phụ kiện Apple cũ"],
  ],
};

const englishText = {
  "PhongVu.vn | Laptop, PC, Màn hình": "PhongVu.vn | Laptops, PCs, Monitors",
  "Trang frontend mô phỏng Phong Vũ với khuyến mãi, danh mục, banner và sản phẩm.": "A Phong Vu-inspired storefront with deals, categories, banners, and products.",
  "Khuyến mãi sinh nhật": "Birthday promotion",
  "Bớt giá đầy deal 29 năm": "29th anniversary deals",
  "Thanh điều hướng nhanh": "Quick navigation",
  "Hệ thống Showroom": "Showroom system",
  "Dành Cho Doanh Nghiệp": "For Business",
  "Hotline: 18006867": "Hotline: 18006867",
  "Tin công nghệ": "Tech news",
  "Xây dựng cấu hình": "Build your PC",
  "Khuyến mãi": "Promotions",
  "Phong Vũ": "Phong Vu",
  "Danh mục sản phẩm": "Product categories",
  "Bạn muốn mua gì hôm nay...": "What would you like to buy today...",
  "Thử: laptop văn phòng mỏng nhẹ dưới 18 triệu": "Try: thin-and-light office laptop under 18 million VND",
  "Tìm kiếm sản phẩm": "Search products",
  "Tìm sản phẩm trong catalog demo": "Search products in the demo catalog",
  "Tìm kiếm": "Search",
  "Từ khóa gợi ý": "Suggested keywords",
  "Màn Hình": "Monitor",
  "Đăng nhập": "Log in",
  "Đăng ký": "Sign up",
  "Thông báo": "Notifications",
  "Giỏ hàng của bạn": "Your cart",
  "(0) sản phẩm": "(0) items",
  "Khuyến mãi chính": "Main promotion",
  "Danh mục sản phẩm mở rộng": "Expanded product categories",
  "Banner khuyến mãi": "Promotion banner",
  "Banner trước": "Previous banner",
  "Banner sau": "Next banner",
  "Chọn banner": "Choose banner",
  "Banner sinh nhật": "Birthday banner",
  "Banner bóng đá": "Football banner",
  "Banner bên phải": "Right banners",
  "Phong Vũ EDU": "Phong Vu EDU",
  "Khuyến mãi tháng này": "This month's promotions",
  "tháng này": "this month",
  "Quà tặng": "Gifts",
  "hấp dẫn": "Hot offers",
  "Quà tặng hấp dẫn": "Attractive gifts",
  "Ưu đãi hot": "Hot deals",
  "Giờ vàng giá sốc": "Golden-hour shock deals",
  "Sinh nhật siêu deal": "Birthday super deals",
  "Máy lạnh": "Air conditioners",
  "Trả góp 0%": "0% installment",
  "Tải app Phong Vũ": "Download Phong Vu app",
  "Xả kho trưng bày": "Display clearance",
  "Dải ưu đãi hè": "Summer deals strip",
  "Flash sale online": "Online flash sale",
  "Giảm Đến 200K": "Save up to 200K",
  "Ưu Đãi Sốc Đến 22%": "Shock deals up to 22%",
  "Camera & Phụ Kiện": "Camera & Accessories",
  "MUA NGAY KẺO HẾT!!!": "BUY NOW BEFORE IT ENDS!!!",
  "Máy In & Mực": "Printers & Ink",
  "Camera-Phụ Kiện": "Cameras - Accessories",
  "Coupon Đến 1TR": "Coupons up to 1M",
  "Giảm Đến 56%": "Up to 56% off",
  "Giảm Tới 21%": "Up to 21% off",
  "Giảm Đến 32%": "Up to 32% off",
  "Giảm Sốc Đến 55%": "Up to 55% off",
  "*Giới hạn 01 sản phẩm / 1 khách hàng trong chương trình": "*Limit 01 product / 1 customer during this program",
  "Kết thúc sau 2 ngày": "Ends in 2 days",
  "Kết thúc sau 4 ngày": "Ends in 4 days",
  "Kết thúc trong hôm nay": "Ends today",
  "Đếm ngược flash sale": "Flash sale countdown",
  "Số lượng có hạn": "Limited quantity",
  "Mua ngay kẻo hết": "Buy now before it ends",
  "Yêu thích": "Wishlist",
  "Tiết kiệm 5.000.000 đ": "Save 5,000,000 VND",
  "Tiết kiệm 4.000.000 đ": "Save 4,000,000 VND",
  "Tiết kiệm 5.100.000 đ": "Save 5,100,000 VND",
  "Tiết kiệm 3.000.000 đ": "Save 3,000,000 VND",
  "Tiết kiệm 2.200.000 đ": "Save 2,200,000 VND",
  "Tiết kiệm 4.500.000 đ": "Save 4,500,000 VND",
  "Tiết kiệm 8.000.000 đ": "Save 8,000,000 VND",
  "Tiết kiệm 2.000.000 đ": "Save 2,000,000 VND",
  "Tiết kiệm 1.500.000 đ": "Save 1,500,000 VND",
  "COMBO GIẢM ~ 50.000 đ": "COMBO SAVE ~ 50,000 VND",
  "Thêm vào giỏ": "Add to cart",
  "Danh mục nổi bật": "Featured categories",
  "Xem tất cả ›": "View all ›",
  "Liên hệ nhanh": "Quick contact",
  "Trò chuyện với": "Chat with",
  "trợ lý ảo": "virtual assistant",
  "Trò chuyện với trợ lý ảo": "Chat with virtual assistant",
  "Trợ lý ảo luôn sẵn sàng": "Virtual assistant is ready",
  "Đóng": "Close",
  "Xin chào! Tôi có thể giúp bạn tìm laptop, PC hoặc khuyến mãi phù hợp.": "Hello! I can help you find suitable laptops, PCs, or promotions.",
  "Tư vấn laptop": "Laptop advice",
  "Tìm khuyến mãi": "Find promotions",
  "Hỗ trợ đơn hàng": "Order support",
  "Nhập nội dung...": "Type a message...",
  "Nhập nội dung chat": "Type a chat message",
  "Gửi tin nhắn": "Send message",
  "Đang đọc catalog và ngữ cảnh mua hàng": "Reading catalog and shopping context",
  "FAQ chính sách": "Policy FAQ",
  "Xin chào! Hãy thử hỏi: “laptop văn phòng mỏng nhẹ dưới 18 triệu”. Mình sẽ lọc store và đề xuất sản phẩm ngay trong màn hình này.": "Hello! Try asking: \"thin-and-light office laptop under 18 million VND\". I will filter the store and recommend products right in this screen.",
  "Laptop văn phòng mỏng nhẹ dưới 18 triệu": "Thin-and-light office laptop under 18 million VND",
  "So sánh 2 sản phẩm đang xem": "Compare the 2 viewed products",
  "Màn hình 27 inch làm việc tại nhà": "27-inch monitor for working from home",
  "Cần sales tư vấn cấu hình": "Need sales advice on a build",
  "Chuyển sales tư vấn nhanh": "Hand off to sales",
  "Tên của bạn": "Your name",
  "Số điện thoại": "Phone number",
  "Email (không bắt buộc)": "Email (optional)",
  "Email không bắt buộc": "Optional email",
  "Nhu cầu/ngân sách": "Need/budget",
  "Nhu cầu hoặc ngân sách": "Need or budget",
  "Thời gian muốn nhận cuộc gọi": "Preferred callback time",
  "Tôi đồng ý để Phong Vũ liên hệ tư vấn.": "I agree for Phong Vu to contact me for advice.",
  "Gửi lead": "Send lead",
  "Để sau": "Later",
  "Nhập nhu cầu, ngân sách hoặc SKU...": "Enter need, budget, or SKU...",
  "Chuyển giữa cửa hàng và chat": "Switch between store and chat",
  "Cửa hàng": "Store",
  "Thu gọn khung chat": "Compact chat panel",
  "Mở rộng khung chat": "Expand chat panel",
  "Cảm ơn bạn! Trợ lý ảo sẽ phản hồi ngay. Bạn có thể cho mình biết nhu cầu hoặc ngân sách không?": "Thanks! The virtual assistant will reply shortly. Could you share your needs or budget?",
  "Tivi chuẩn nét": "Crisp TV deals",
  "Bảo hành toàn diện": "Complete warranty",
  "Sắm Laptop Acer Gaming nhận ngay Giftcode": "Buy Acer Gaming laptops and get a gift code",
  "MacBook Neo giá bất ngờ": "MacBook Neo, surprising price",
  "Lenovo sập deal": "Lenovo deal drop",
  "Màn deal chuẩn VAR chuẩn nét": "Sharp football deals",
  "Hè 2K8 show điểm giảm sâu": "2K8 summer deep-discount show",
  "Build PC giảm thêm tới 2 triệu": "Build PC, save up to 2 million VND",
  "Laptop Gaming RTX 4050 chỉ từ 24.990 triệu": "RTX 4050 gaming laptops from 24.990M VND",
  "Laptop văn phòng": "Office laptop",
  "Laptop gaming": "Gaming laptop",
  "iPhone 17 Pro Max chỉ từ 35.990 triệu": "iPhone 17 Pro Max from 35.990M VND",
  "Màn hình OLED giá chỉ từ 12 triệu": "OLED monitors from 12M VND",
  "Tivi chuẩn nét giảm đến 50%": "Crisp TV deals up to 50% off",
  "Laptop Acer Aspire Go 15": "Acer Aspire Go 15 laptop",
  "Laptop HP 14": "HP 14 laptop",
  "Laptop Acer Nitro Lite 16": "Acer Nitro Lite 16 laptop",
  "Laptop Acer Nitro ProPanel": "Acer Nitro ProPanel laptop",
  "Laptop Dell 16": "Dell 16 laptop",
  "Laptop Asus Vivobook 16": "Asus Vivobook 16 laptop",
  "Laptop HP Omnibook": "HP Omnibook laptop",
  "Laptop Lenovo IdeaPad Slim 5": "Lenovo IdeaPad Slim 5 laptop",
  "Laptop Acer Aspire AI": "Acer Aspire AI laptop",
  "Laptop MSI Modern 15": "MSI Modern 15 laptop",

  "Laptop": "Laptops",
  "Sản phẩm Apple": "Apple products",
  "Điện máy": "Electronics",
  "Điện gia dụng": "Home appliances",
  "PC - Máy tính bàn": "Desktop PCs",
  "Màn hình máy tính": "Monitors",
  "Linh kiện máy tính": "PC components",
  "Phụ kiện máy tính": "Computer accessories",
  "Điện thoại, Tablet, Phụ...": "Phones, tablets, accessories",
  "Phụ kiện": "Accessories",
  "Phụ Kiện": "Accessories",
  "Thiết bị âm thanh": "Audio devices",
  "Thiết bị văn phòng": "Office equipment",
  "Thiết Bị Văn Phòng": "Office equipment",
  "Giải pháp doanh nghiệp": "Business solutions",
  "Hàng thanh lý": "Clearance",
  "Linh Kiện": "Components",
  "Thiết Bị Mạng": "Networking",
  "Thiết Bị An Ninh": "Security devices",
  "Điện Máy - Điện Gia Dụng": "Electronics - Home appliances",

  "Thương hiệu": "Brands",
  "Nhu cầu": "Use cases",
  "Cấu hình": "Configuration",
  "Laptop đồ họa": "Graphic-design laptops",
  "Laptop Sinh viên": "Student laptops",
  "Laptop Văn Phòng": "Office laptops",
  "Laptop cảm ứng 2 in 1": "2-in-1 touch laptops",
  "Laptop mỏng nhẹ": "Thin and light laptops",
  "Laptop Doanh nhân": "Business laptops",
  "Phụ kiện Apple": "Apple accessories",
  "Củ sạc & Cáp sạc": "Chargers & cables",
  "Tai nghe Apple": "Apple headphones",
  "Bàn phím, chuột & bút": "Keyboards, mice & pens",
  "Theo thương hiệu": "By brand",
  "Theo tính năng": "By feature",
  "Máy giặt": "Washing machines",
  "Điều hòa - Máy lạnh": "Air conditioners",
  "Tủ lạnh": "Refrigerators",
  "Máy nước nóng": "Water heaters",
  "Máy giặt cửa trước": "Front-load washing machines",
  "Máy giặt cửa trên": "Top-load washing machines",
  "Máy sấy quần áo": "Dryers",
  "Máy lạnh Inverter": "Inverter air conditioners",
  "Công suất 1 HP": "1 HP capacity",
  "Công suất 1.5 HP": "1.5 HP capacity",
  "Công suất 2 HP": "2 HP capacity",
  "Máy nước nóng trực tiếp": "Instant water heaters",
  "Máy nước nóng gián tiếp": "Storage water heaters",
  "Gia dụng nhà bếp": "Kitchen appliances",
  "Bếp điện từ": "Induction cookers",
  "Bếp hồng ngoại": "Infrared cookers",
  "Bình thủy điện": "Electric water dispensers",
  "Lò nướng": "Ovens",
  "Lò vi sóng": "Microwaves",
  "Nồi cơm điện": "Rice cookers",
  "Nồi áp suất": "Pressure cookers",
  "Nồi chiên không dầu": "Air fryers",
  "Bình đun": "Kettles",
  "Máy chế biến": "Food preparation",
  "Máy xay thực phẩm": "Food processors",
  "Máy xay sinh tố": "Blenders",
  "Máy xay thịt": "Meat grinders",
  "Máy ép chậm": "Slow juicers",
  "Máy ép trái cây": "Juicers",
  "Máy vắt cam": "Citrus juicers",
  "Máy pha cà phê": "Coffee machines",
  "Máy rửa chén bát": "Dishwashers",
  "Chăm sóc nhà cửa": "Home care",
  "Máy lọc không khí": "Air purifiers",
  "Máy tạo ẩm": "Humidifiers",
  "Máy hút ẩm": "Dehumidifiers",
  "Máy hút bụi": "Vacuum cleaners",
  "Robot hút bụi": "Robot vacuums",
  "Quạt": "Fans",
  "Quạt điều hòa": "Air coolers",
  "Máy lọc nước": "Water purifiers",
  "Làm đẹp": "Beauty",
  "Máy rửa mặt": "Facial cleansers",
  "Máy sấy tóc": "Hair dryers",
  "Gia dụng không điện": "Non-electric appliances",
  "Nồi": "Pots",
  "Chảo": "Pans",
  "Hộp đựng thức ăn": "Food containers",
  "Bình giữ nhiệt": "Thermos bottles",
  "Theo cấu hình VGA": "By GPU configuration",
  "PC văn phòng": "Office PCs",
  "PC đồ họa": "Graphic-design PCs",
  "PC lắp ráp": "Custom-built PCs",
  "Theo cấu hình CPU Intel": "By Intel CPU",
  "Theo cấu hình CPU AMD": "By AMD CPU",
  "Phân khúc giá": "Price segment",
  "10 triệu": "10 million",
  "15 triệu": "15 million",
  "20 triệu": "20 million",
  "30 triệu": "30 million",
  "Tần số quét": "Refresh rate",
  "Theo kích cỡ": "By size",
  "Theo nhu cầu": "By need",
  "Theo giá": "By price",
  "Độ phân giải": "Resolution",
  "Dưới 19 inch": "Under 19 inches",
  "Dưới 3 triệu": "Under 3 million",
  "3 đến 5 triệu": "3 to 5 million",
  "5 đến 10 triệu": "5 to 10 million",
  "10 đến 15 triệu": "10 to 15 million",
  "15 đến 20 triệu": "15 to 20 million",
  "Trên 20 triệu": "Over 20 million",
  "Ổ cứng": "Storage drives",
  "Ổ cứng SSD": "SSD drives",
  "Ổ cứng HDD": "HDD drives",
  "Ổ cứng di động": "Portable drives",
  "CPU - Bộ vi xử lý": "CPU - Processors",
  "Case - Thùng máy tính": "PC cases",
  "PSU - Nguồn máy tính": "PSU - Power supplies",
  "VGA - Card màn hình": "VGA - Graphics cards",
  "Mainboard - Bo mạch chủ": "Motherboards",
  "Tản nhiệt PC": "PC cooling",
  "Tản nhiệt khí": "Air cooling",
  "Tản nhiệt nước": "Liquid cooling",
  "Chuột máy tính": "Computer mice",
  "Bàn phím": "Keyboards",
  "Lót chuột": "Mouse pads",
  "Ghế gaming": "Gaming chairs",
  "Tay cầm chơi game": "Game controllers",
  "Chuột Gaming": "Gaming mice",
  "Bàn phím Gaming": "Gaming keyboards",
  "Tai nghe Gaming": "Gaming headsets",
  "Thiết bị Livestream": "Livestream gear",
  "Máy chơi game": "Game consoles",
  "Đồng hồ thông minh": "Smart watches",
  "Phụ kiện điện thoại": "Phone accessories",
  "Máy tính bảng": "Tablets",
  "Phụ kiện máy tính bảng": "Tablet accessories",
  "Điện thoại": "Phones",
  "Thiết bị đeo": "Wearables",
  "Phụ kiện đồng hồ": "Watch accessories",
  "Phụ kiện laptop": "Laptop accessories",
  "Linh kiện laptop": "Laptop parts",
  "Lưu trữ - Chuyển đổi": "Storage - Adapters",
  "Phụ kiện khác": "Other accessories",
  "Tai nghe": "Headphones",
  "Loa nghe nhạc": "Speakers",
  "MicroPhone": "Microphones",
  "Loại tai nghe": "Headphone types",
  "Các loại loa": "Speaker types",
  "Thiết bị mạng": "Networking devices",
  "Camera an ninh": "Security cameras",
  "Máy in văn phòng": "Office printers",
  "Thiết bị khác": "Other devices",
  "Máy Scan": "Scanners",
  "Mực in - Giấy in": "Ink - Paper",
  "Phần mềm": "Software",
  "Máy Fax": "Fax machines",
  "Thiết bị doanh nghiệp": "Enterprise devices",
  "Thiết bị hội nghị": "Conference devices",
  "Màn hình cũ": "Used monitors",
  "Laptop cũ": "Used laptops",
  "Linh kiện máy tính cũ": "Used PC components",
  "Điện máy & Gia dụng cũ": "Used electronics & appliances",
  "Gear cũ": "Used gear",
  "Máy in cũ": "Used printers",
  "Phụ kiện cũ": "Used accessories",
  "Sản phẩm Apple cũ": "Used Apple products",
  "Khác": "Other",
};

Object.assign(englishText, {
  "32 inch trở lên": "32 inches and above",
  "Acer cũ": "Used Acer",
  "Apple Watch cũ": "Used Apple Watch",
  "ASUS cũ": "Used ASUS",
  "Balo - túi chống sốc": "Backpacks - shockproof bags",
  "Bàn chải điện": "Electric toothbrushes",
  "Bàn Gaming": "Gaming desks",
  "Bàn gaming E-Dra": "E-Dra gaming desks",
  "Bàn gaming Warrior": "Warrior gaming desks",
  "Bàn ghế cũ": "Used desks and chairs",
  "Bàn phím cũ": "Used keyboards",
  "Bàn phím laptop": "Laptop keyboards",
  "Bàn ủi": "Irons",
  "Bao da - Ốp lưng": "Cases - covers",
  "Brother cũ": "Used Brother",
  "Bút cảm ứng": "Stylus pens",
  "Camera hành trình": "Dash cameras",
  "Camera hội nghị": "Conference cameras",
  "Canon cũ": "Used Canon",
  "Cáp chuyển - cáp nối": "Adapters - cables",
  "Cáp mạng": "Network cables",
  "Cáp sạc": "Charging cables",
  "Card màn hình cũ": "Used graphics cards",
  "Card mạng": "Network cards",
  "CASE cũ": "Used PC cases",
  "Cây nước nóng lạnh": "Hot and cold water dispensers",
  "Chuột cũ": "Used mice",
  "CPU cũ": "Used CPUs",
  "Cục sạc": "Chargers",
  "Dán màn hình": "Screen protectors",
  "Dây đeo": "Straps",
  "Dell cũ": "Used Dell",
  "Diệt Virus": "Antivirus",
  "Đầu chuyển": "Adapters",
  "Đầu đọc thẻ nhớ": "Card readers",
  "Đầu ghi hình": "Video recorders",
  "Đế sạc": "Charging docks",
  "Đế tản nhiệt": "Cooling pads",
  "Epson cũ": "Used Epson",
  "Ghế Gaming": "Gaming chairs",
  "Gia dụng nhà bếp cũ": "Used kitchen appliances",
  "Giá đỡ": "Stands",
  "Giấy in": "Printing paper",
  "Gigabyte cũ": "Used Gigabyte",
  "Hội nghị truyền hình": "Video conferencing",
  "HP cũ": "Used HP",
  "Intel thế hệ 12": "Intel 12th generation",
  "iPad cũ": "Used iPad",
  "iPhone cũ": "Used iPhone",
  "Kính cường lực": "Tempered glass",
  "KM mua 1 được 4": "Buy 1 get 4 promotion",
  "Lenovo cũ": "Used Lenovo",
  "LG cũ": "Used LG",
  "Loa hội nghị": "Conference speakers",
  "Loa kéo": "Portable trolley speakers",
  "Loa vi tính": "Computer speakers",
  "Lót chuột - Bàn di chuột": "Mouse pads - desk mats",
  "Lót chuột cũ": "Used mouse pads",
  "MacBook cũ": "Used MacBook",
  "Mainboard cũ": "Used motherboards",
  "Màn hình Acer cũ": "Used Acer monitors",
  "Màn hình AOC cũ": "Used AOC monitors",
  "Màn hình Asus cũ": "Used Asus monitors",
  "Màn hình cong": "Curved monitors",
  "Màn hình Dell cũ": "Used Dell monitors",
  "Màn hình đồ họa": "Design monitors",
  "Màn hình Gaming": "Gaming monitors",
  "Màn hình Gigabyte cũ": "Used Gigabyte monitors",
  "Màn hình HP cũ": "Used HP monitors",
  "Màn hình LC-Power cũ": "Used LC-Power monitors",
  "Màn hình Lenovo cũ": "Used Lenovo monitors",
  "Màn hình LG cũ": "Used LG monitors",
  "Màn hình máy tính có cổng USB Type-C": "USB Type-C monitors",
  "Màn hình MSI cũ": "Used MSI monitors",
  "Màn hình OLED": "OLED monitors",
  "Màn hình Philips cũ": "Used Philips monitors",
  "Màn hình Samsung cũ": "Used Samsung monitors",
  "Màn hình văn phòng": "Office monitors",
  "Màn hình ViewSonic cũ": "Used ViewSonic monitors",
  "Màn hình Xiaomi cũ": "Used Xiaomi monitors",
  "Máy ảnh": "Cameras",
  "Máy chấm công": "Time attendance machines",
  "Máy chiếu": "Projectors",
  "Máy chơi Game cầm tay": "Handheld game consoles",
  "Máy chủ - Server": "Servers",
  "Máy đánh trứng": "Egg beaters",
  "Máy đẩy tinh chất": "Facial essence devices",
  "Máy đếm tiền": "Money counters",
  "Máy ép nhựa": "Laminators",
  "Máy ghi âm": "Voice recorders",
  "Máy giặt, sấy cũ": "Used washers and dryers",
  "Máy hút bụi, robot hút bụi cũ": "Used vacuums and robot vacuums",
  "Máy hút mùi": "Range hoods",
  "Máy hủy tài liệu": "Paper shredders",
  "Máy in đa năng": "All-in-one printers",
  "Máy in kim": "Dot matrix printers",
  "Máy in Laser": "Laser printers",
  "Máy in phun": "Inkjet printers",
  "Máy massage": "Massagers",
  "Máy nhồi bột": "Dough mixers",
  "Máy quay phim": "Camcorders",
  "Máy quét mã vạch": "Barcode scanners",
  "Máy tăm nước": "Water flossers",
  "Máy tính để bàn": "Desktop computers",
  "Máy tính tiền": "Cash registers",
  "Máy triệt lông": "Hair removal devices",
  "Máy xay cà phê": "Coffee grinders",
  "Micro hội nghị": "Conference microphones",
  "Miếng dán Canvas": "Canvas screen films",
  "Miếng lót bàn phím": "Keyboard covers",
  "MSI cũ": "Used MSI",
  "Mực in Laser": "Laser toner",
  "Mực in phun": "Inkjet ink",
  "Nồi hấp thực phẩm": "Food steamers",
  "Ổ cứng cũ": "Used drives",
  "Ổ cứng gắn ngoài": "External drives",
  "Ổ cứng mạng - NAS": "Network storage - NAS",
  "Ốp bảo vệ": "Protective cases",
  "Ốp lưng": "Cases",
  "Phần mềm hội nghị": "Conference software",
  "Phụ kiện Apple cũ": "Used Apple accessories",
  "Phụ kiện hội nghị": "Conference accessories",
  "Pin dự phòng": "Power banks",
  "POS cầm tay": "Handheld POS",
  "PSU cũ": "Used PSUs",
  "Quạt, thiết bị làm mát cũ": "Used fans and cooling devices",
  "RAM cũ": "Used RAM",
  "Ruy băng": "Printer ribbons",
  "Sạc laptop": "Laptop chargers",
  "Soundcard - Bộ trộn âm thanh": "Soundcards - audio mixers",
  "Tai nghe cũ": "Used headphones",
  "Tai nghe không dây": "Wireless headphones",
  "Tản nhiệt cũ": "Used cooling parts",
  "Thẻ nhớ": "Memory cards",
  "Thiết bị giải trí và kỹ thuật số cũ": "Used entertainment and digital devices",
  "Thiết bị làm đẹp, chăm sóc cá nhân cũ": "Used beauty and personal care devices",
  "Thiết bị Livestream cũ": "Used livestream gear",
  "Thiết bị lưu trữ cũ": "Used storage devices",
  "Thiết bị sạc, pin cũ": "Used chargers and batteries",
  "Tivi cũ": "Used TVs",
  "Tủ lạnh Inverter": "Inverter refrigerators",
  "Tủ lạnh ngăn đá dưới": "Bottom-freezer refrigerators",
  "Tủ lạnh ngăn đá trên": "Top-freezer refrigerators",
  "Tủ lạnh Side-by-Side": "Side-by-side refrigerators",
  "Tủ lạnh, tủ đông, tủ mát, tủ rượu cũ": "Used refrigerators, freezers, coolers, and wine cabinets",
  "Tủ rượu": "Wine cabinets",
  "Ví": "Wallets",
  "Vòng giữ điện thoại": "Phone rings",
});

const attrMemory = new WeakMap();
const textMemory = new WeakMap();
let currentLanguage = localStorage.getItem("pv-language") || "vi";

function tr(text) {
  return currentLanguage === "en" ? englishText[text] || text : text;
}

function uiText(viText, enText) {
  return currentLanguage === "en" ? enText : viText;
}

function localizeNeedText(need) {
  const normalized = normalizeCatalogText(need);
  if (normalized.includes("hoc lap trinh") || normalized.includes("programming")) return uiText("Học lập trình", "Programming");
  if (normalized.includes("hoc tap") || normalized.includes("study")) return uiText("Học tập", "Study");
  if (normalized.includes("gaming")) return "Gaming";
  if (normalized.includes("do hoa") || normalized.includes("graphics")) return uiText("Đồ họa", "Graphics");
  if (normalized.includes("van phong") || normalized.includes("office")) return uiText("Văn phòng", "Office work");
  return need || "";
}

let activeIndex = 0;
let activeImage = slideImages[0];
let standbyImage = slideImages[1];
let autoplayId = null;
let isAnimating = false;

slides.forEach((slide) => {
  const image = new Image();
  image.src = slide.src;
});

function setDot(index) {
  dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
}

function restartAutoplay() {
  window.clearInterval(autoplayId);
  if (!reduceMotion && slides.length > 1) {
    autoplayId = window.setInterval(() => showSlide(activeIndex + 1, 1, false), 3000);
  }
}

function showSlide(requestedIndex, direction = 1, resetTimer = true) {
  if (!activeImage || !standbyImage || isAnimating) return;

  const index = (requestedIndex + slides.length) % slides.length;
  if (index === activeIndex) {
    if (resetTimer) restartAutoplay();
    return;
  }

  isAnimating = true;
  const slide = slides[index];
  const enteringFrom = direction < 0 ? "from-left" : "from-right";
  const exitingTo = direction < 0 ? "exit-right" : "exit-left";

  standbyImage.src = slide.src;
  standbyImage.alt = slide.alt;
  standbyImage.removeAttribute("aria-hidden");
  standbyImage.className = `slider-image ${enteringFrom}`;

  activeImage.classList.add(exitingTo);
  setDot(index);

  window.requestAnimationFrame(() => {
    standbyImage.classList.add("is-active");
    standbyImage.classList.remove("from-left", "from-right");
  });

  window.setTimeout(() => {
    activeImage.className = "slider-image";
    activeImage.setAttribute("aria-hidden", "true");

    const oldActive = activeImage;
    activeImage = standbyImage;
    standbyImage = oldActive;
    activeIndex = index;
    isAnimating = false;

    if (resetTimer) restartAutoplay();
  }, reduceMotion ? 0 : 560);
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    const direction = index > activeIndex ? 1 : -1;
    showSlide(index, direction);
  });
});

document.querySelector(".slider-arrow.prev")?.addEventListener("click", () => {
  showSlide(activeIndex - 1, -1);
});

document.querySelector(".slider-arrow.next")?.addEventListener("click", () => {
  showSlide(activeIndex + 1, 1);
});

slider?.addEventListener("mouseenter", () => window.clearInterval(autoplayId));
slider?.addEventListener("mouseleave", restartAutoplay);
slider?.addEventListener("focusin", () => window.clearInterval(autoplayId));
slider?.addEventListener("focusout", restartAutoplay);

const flashCountdownLabel = document.querySelector("[data-flash-countdown-label]");
const flashCountdownBoxes = [...document.querySelectorAll(".flash-sale-section .countdown b")];
const flashSaleDurationMs = 4.5 * 24 * 60 * 60 * 1000;
const flashSaleEpochMs = Date.UTC(2026, 0, 1, 0, 0, 0);

function updateFlashCountdown() {
  if (!flashCountdownBoxes.length) return;

  const elapsed = ((Date.now() - flashSaleEpochMs) % flashSaleDurationMs + flashSaleDurationMs) % flashSaleDurationMs;
  const remaining = Math.max(0, flashSaleDurationMs - elapsed);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const values = [days, hours, minutes, seconds];

  flashCountdownBoxes.forEach((box, index) => {
    box.textContent = String(values[index] || 0).padStart(2, "0");
  });

  if (flashCountdownLabel) {
    flashCountdownLabel.textContent = days > 0
      ? uiText(`Kết thúc sau ${days} ngày`, `Ends in ${days} day${days === 1 ? "" : "s"}`)
      : uiText("Kết thúc trong hôm nay", "Ends today");
  }
}

updateFlashCountdown();
window.setInterval(updateFlashCountdown, 1000);

const headerSearchForm = document.querySelector(".search-form");
const assistantToggle = document.querySelector(".assistant-toggle");
const assistantPanel = document.querySelector("#assistantChatPanel");
const assistantClose = document.querySelector(".assistant-close");
const assistantResize = document.querySelector(".assistant-resize");
const assistantForm = document.querySelector(".assistant-chat-form");
const assistantInput = assistantForm?.querySelector("input");
const assistantBody = document.querySelector(".assistant-chat-body");
const assistantContextBar = document.querySelector("[data-assistant-context]");
const leadForm = document.querySelector("[data-lead-form]");
const catalogWorkspace = document.querySelector("#catalogWorkspace");
const catalogSearchForm = document.querySelector(".catalog-search-form");
const catalogSearchInput = catalogSearchForm?.querySelector("input");
const catalogCategoryFilter = document.querySelector(".catalog-category-filter");
const catalogBudgetFilter = document.querySelector(".catalog-budget-filter");
const catalogAiPrompt = document.querySelector(".catalog-ai-prompt");
const catalogResults = document.querySelector("[data-catalog-results]");
const productDetailPanel = document.querySelector("[data-product-detail]");
const catalogCount = document.querySelector("[data-catalog-count]");
const catalogContext = document.querySelector("[data-catalog-context]");
const contextChips = document.querySelector("[data-context-chips]");
const eventStream = document.querySelector("[data-event-stream]");
const mobileSplitTabs = document.querySelector("[data-mobile-split-tabs]");
let assistantSessionId = localStorage.getItem("pv-assistant-session-id");
let assistantIsSending = false;
const catalogState = {
  products: [],
  visibleProducts: [],
  selectedCategory: "",
  selectedBudget: "",
  query: "",
  userNeed: "",
  viewedSkus: new Set(JSON.parse(localStorage.getItem("pv-viewed-skus") || "[]")),
  shortlistedSkus: new Set(JSON.parse(localStorage.getItem("pv-shortlisted-skus") || "[]")),
  focusedSku: "",
  events: [],
};
const kpiCounts = JSON.parse(localStorage.getItem("pv-kpi-counts") || "{}");
let anonymousUserId = localStorage.getItem("pv-anonymous-user-id");

if (!anonymousUserId) {
  anonymousUserId = globalThis.crypto?.randomUUID?.() || `pv-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem("pv-anonymous-user-id", anonymousUserId);
}

function normalizeCatalogText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasCatalogKeyword(normalizedText, keyword) {
  const normalizedKeyword = normalizeCatalogText(keyword);
  if (!normalizedKeyword) return false;
  const pattern = normalizedKeyword
    .split(" ")
    .filter(Boolean)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  return new RegExp(`(^|\\s)${pattern}(?=\\s|$)`).test(normalizedText);
}

function hasAnyCatalogKeyword(normalizedText, keywords = []) {
  return keywords.some((keyword) => hasCatalogKeyword(normalizedText, keyword));
}

function formatVnd(value) {
  if (!Number.isFinite(Number(value))) return uiText("Liên hệ", "Contact for price");
  return `${Number(value).toLocaleString("vi-VN")} đ`;
}

function compactText(text, maxLength = 120) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const flashSaleProducts = {
  laptop: [
    {
      brand: "ACER",
      name: "Laptop Acer Aspire Go 15 AG15-72P-54GY Core 5...",
      image: "assets/images/categories/unnamed (3).webp",
      price: 19990000,
      oldPrice: 24990000,
      save: 5000000,
    },
    {
      brand: "HP",
      name: "Laptop HP 14-ep1007TU-9Z2W1PA Core 7...",
      image: "assets/images/categories/unnamed.webp",
      price: 23990000,
      oldPrice: 27990000,
      save: 4000000,
    },
    {
      brand: "ACER",
      name: "Laptop Acer Nitro Lite 16 NL16-71G-56WQ i5...",
      image: "assets/images/categories/unnamed (1).webp",
      price: 24490000,
      oldPrice: 29590000,
      save: 5100000,
    },
    {
      brand: "ACER",
      name: "Laptop Acer Nitro ProPanel ANV15-51-56D5 i5...",
      image: "assets/images/categories/unnamed (2).webp",
      price: 24990000,
      oldPrice: 27990000,
      save: 3000000,
    },
    {
      brand: "DELL",
      name: "Laptop Dell 16 DC16250-C7U161W11BLU Core 7...",
      image: "assets/images/categories/unnamed (4).webp",
      price: 27690000,
      oldPrice: 29890000,
      save: 2200000,
    },
  ],
  gear: [
    {
      brand: "KINGMASTER",
      name: "Miếng lót chuột Kingmaster KM-M1 Tiếng Việt",
      image: "https://lh3.googleusercontent.com/IUFtA13pk9gQVe-nd8QH8_tQHy2Ud2obqMwPTAq-DGbiCR6AEJILPC0BF1zlUq4uHKuGrOb8nsW_wQq0U0o",
      price: 79000,
      oldPrice: 99000,
      save: 20000,
    },
    {
      brand: "SONY",
      name: "Tai nghe Sony MDR-EX15APBZE (Đen)",
      image: "https://lh3.googleusercontent.com/taW9LHDD0RYxp8FW_17e8js-SY2QmdL4ysqu8BFUObyCWZ-qKkQyx3LGGRO5llrWqim7GPw138UmyKZr8pmMXKN6q1Tstj8",
      price: 179000,
      oldPrice: 199000,
      save: 20000,
    },
    {
      brand: "SONY",
      name: "Tai nghe không dây in-ear Sony WI-C100/BZ E (Đen)",
      image: "https://lh3.googleusercontent.com/CdpFW3wv5aR64bDFqpo0xMGfuCgdLhvRds8VmjfVF004ORZiw9AWTcdeeAeuY5zR_iPlcglcOaXci8OJOGAbxiJ-bvM5rFKK",
      price: 490000,
      oldPrice: 590000,
      save: 100000,
    },
    {
      brand: "BASEUS",
      name: "Tai nghe không dây chàng đầu Baseus Bowie H1s (Đen)",
      image: "https://lh3.googleusercontent.com/y_ZugiE04k__i8I-CnnIboxJ9ovsHsxjmjeCwWtxew33ls-ngoUsEggBS5WaMUx1xtAkmYBtcrS3tMHHBsvOR8CKtLB8gEj-",
      price: 599000,
      oldPrice: 1190000,
      save: 591000,
    },
    {
      brand: "NEWMEN",
      name: "Bàn phím cơ Gaming có dây Newmen GM328 Plus...",
      image: "https://lh3.googleusercontent.com/08UEwi-Kxu9R6j2QDIfu5fwCYlZEWd3OfDhsGb0dqUy6WWWQwA2XWco6GtiV5oMo46oa5qVlZJjtX7dayKxJ9bTpk97It6fMxw",
      price: 899000,
      oldPrice: 1490000,
      save: 591000,
    },
  ],
  monitor: [
    {
      brand: "HKC",
      name: "Màn hình LCD HKC 21.45 inch MB21V13-U Full HD...",
      image: "https://lh3.googleusercontent.com/mTzFWdHT3ng9aidtnJ5L1jRA7r3fXzu6LMX1nI4nWRRnqZKANggUFtUYqsrUa4MTFhFWS8pOvMEomjvQ1CE4X0Gqswv_4Oo",
      price: 1290000,
      oldPrice: 1590000,
      save: 300000,
    },
    {
      brand: "SAMSUNG",
      name: "Màn hình LCD Samsung 24 inch LS24C366EAEXXV...",
      image: "https://lh3.googleusercontent.com/rOsQqCn0PutM5MJi5TjDUlGXLDSQDypXDnSCyrC0lrKeqkNqR8taZ30SX9HtWmKDAsUuK2WqiI9i_lMx0H46_6OYBggTf5U",
      price: 2319000,
      oldPrice: 2790000,
      save: 471000,
    },
    {
      brand: "MSI",
      name: "Màn hình LCD MSI 27 inch MP273Q E7 2K IPS...",
      image: "https://lh3.googleusercontent.com/K-V33S65gOwdVpXmUUbZUPyIhsdhBG-KJzfm_Sw9qAKJPsmsaLZnnJqbeAcsrYe09QQbpestcJsDp-n643wZlSog2wn2agY-",
      price: 2790000,
      oldPrice: 3390000,
      save: 600000,
    },
    {
      brand: "HKC",
      name: "Màn hình LCD HKC 24.5 inch MG25H320 320Hz...",
      image: "https://lh3.googleusercontent.com/31L3XtfZF6twuj9a24mBzg3RxEa4p_ImT9VwW3PUAYOFNR_6NyyMHl7B7zwT_ZxRl2IXM_GI8dAR4FHPDo9A4PJQYdpE0UPJKg",
      price: 3190000,
      oldPrice: 3790000,
      save: 600000,
    },
    {
      brand: "DELL",
      name: "Màn hình LCD Dell 27 inch S2721HN IPS 75Hz...",
      image: "https://lh3.googleusercontent.com/owHUaMSMCaDB53HMdrQmiv17OR8T51xiQQ0yWE323xFjdTE7vx54dvoit6Wq3KbTloPlG2nAuaWlyzNJYWWp5LZG9eVhSDE",
      price: 3990000,
      oldPrice: 4590000,
      save: 600000,
    },
  ],
  printer: [
    {
      brand: "EPSON",
      name: "Mực in phun EPSON Ecotank 003 BK C13T00V100",
      image: "https://lh3.googleusercontent.com/jxifeOcquFPM8YjaRY_PAAzdJ_c_DUERIxVNJPtJGMlXuM-rrgxEpI6k51aX00sRI_zSaA5HWJJsPhF5AIM",
      price: 169000,
      oldPrice: 199000,
      save: 30000,
    },
    {
      brand: "CANON",
      name: "Mực in Canon PG 89",
      image: "https://lh3.googleusercontent.com/pN4z1sCyJeKERyWLp4hpq-knIjr4Qiyi1HhMt9km_XSJ_d20X6xbLLwkI6zaWrkogSkoJ-zLneOnMoASJw",
      price: 399000,
      oldPrice: 469000,
      save: 70000,
    },
    {
      brand: "BROTHER",
      name: "Máy in nhãn cầm tay Brother P-Touch PT-E110",
      image: "https://lh3.googleusercontent.com/690rbDXqKxYDSZ13Nswn1xmipD4qnO5STe1G501OaEX-dxbe_Hm8q0KQjbOv1PyOXaukBbrhay6Z3Xc4CrI",
      price: 1090000,
      oldPrice: 1290000,
      save: 200000,
    },
    {
      brand: "CANON",
      name: "Máy in Canon G1010",
      image: "https://lh3.googleusercontent.com/p8JSZvTWwLr04un4_nzKBXkErAWLuFODQrN2CGVmSRBAJ6iYwM8ihJxa6iUzPMQPMZWcJMhSpztxKiNzxQs",
      price: 2390000,
      oldPrice: 2990000,
      save: 600000,
    },
    {
      brand: "HP",
      name: "Máy in HP Laser 108a 4ZB79A",
      image: "https://lh3.googleusercontent.com/8ug0tb3Dj1OPef50IFSCfZX_RLcIzaRXa0g-9h_CWdCiAoRFKVe2Sfow4hbpFdkXs5vU6VzLS_H_BTGjng5MPiHJff-nhzQ",
      price: 2790000,
      oldPrice: 3290000,
      save: 500000,
    },
  ],
  camera: [
    {
      brand: "XIAOMI",
      name: "Bao chống nước Xiaomi Mi Action Camera 4K",
      image: "https://lh3.googleusercontent.com/DRpE9S-tw8LLO93Ha5WnYaQFK-gkJjNJ6FNux0kEz7HrusBvsOfZw5JSSRotYouo6klPwSym_aNpRkTyMQ_1RpYymfnxrKfq",
      price: 99000,
      oldPrice: 199000,
      save: 100000,
    },
    {
      brand: "XIAOMI",
      name: "Gậy chống rung Camera Xiaomi BGX4020GL",
      image: "https://lh3.googleusercontent.com/OKpsaTtFzTx6JQhszOSvCiqX8xftU7szUlbx7YHcJXsSTyXYYjMaY7TLahLB6q2r2f29RayT12381i8jcZQZUofSrsl44QA",
      price: 450000,
      oldPrice: 799000,
      save: 349000,
    },
    {
      brand: "GOPRO",
      name: "Gậy đa năng GoPro 3-Way Grip Arm Tripod",
      image: "https://lh3.googleusercontent.com/2D-SE4U7HWhVs0PYWbadSfmmdnZX7w6YEq9b3mRxUDS_qJ6qV22rUoU6U_lIFD-t2CEHpbqvA3VhLx2Y3R_zP22CwOqISJg",
      price: 450000,
      oldPrice: 999000,
      save: 549000,
    },
    {
      brand: "A4TECH",
      name: "Webcam A4Tech PK 910H 1080P FHD",
      image: "https://lh3.googleusercontent.com/IAp6sh7f8o1uWjbMibnRzoNfcyaF1d5gFhcE38fK-BUPJKEMagL065Jm-pVM4NylB3PZkPZitzLLJHtH-E9plOW7Jzryz6g_",
      price: 639000,
      oldPrice: 990000,
      save: 351000,
    },
    {
      brand: "HTC",
      name: "Kính thực tế ảo HTC Vive Focus Plus",
      image: "https://lh3.googleusercontent.com/7DD0Op0enkKr9kTrnnCGktGL6I5vhTo5psRrnYfkVgEYu9W9w1AKECpDD-0FC4ilMekV2vNXXam1wYQRoxwf",
      price: 4990000,
      oldPrice: 8990000,
      save: 4000000,
    },
  ],
};

let activeFlashSaleKey = "laptop";

function salePercent(product) {
  if (!product.oldPrice || product.oldPrice <= product.price) return "";
  return `-${Math.round((1 - product.price / product.oldPrice) * 100)}%`;
}

function flashSaleCard(product) {
  const discount = salePercent(product);
  return `
    <article class="product-card">
      <button class="heart" type="button" aria-label="${uiText("Yêu thích", "Add to wishlist")}">♡</button>
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
      <span class="save-label">${uiText("TIẾT KIỆM", "SAVE")} ${escapeHtml(formatVnd(product.save))}</span>
      <b>${escapeHtml(product.brand)}</b>
      <h3>${escapeHtml(compactText(product.name, 74))}</h3>
      <strong>${escapeHtml(formatVnd(product.price))}</strong>
      <span class="sale-old-price"><del>${escapeHtml(formatVnd(product.oldPrice))}</del>${discount ? `<i class="sale-percent">${discount}</i>` : ""}</span>
      <button type="button">${uiText("Thêm vào giỏ", "Add to cart")}</button>
    </article>
  `;
}

function renderFlashSaleProducts(key = activeFlashSaleKey) {
  const row = document.querySelector("[data-sale-products]");
  if (!row) return;
  activeFlashSaleKey = flashSaleProducts[key] ? key : "laptop";
  row.innerHTML = flashSaleProducts[activeFlashSaleKey].map(flashSaleCard).join("");
}

function setupFlashSaleTabs() {
  const tabs = [...document.querySelectorAll("[data-sale-tab]")];
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderFlashSaleProducts(tab.dataset.saleTab);
    });
  });
  renderFlashSaleProducts(activeFlashSaleKey);
}

function productSearchText(product) {
  return normalizeCatalogText([
    product.sku,
    product.name,
    product.brand,
    product.categoryName,
    product.category,
    product.categorySlug,
    product.description,
    product.keySpecs,
    ...(product.specifications || []).flatMap((item) => [item.name, item.value]),
  ].join(" "));
}

function productKeySpecs(product, limit = 3) {
  if (Array.isArray(product.specifications) && product.specifications.length) {
    return product.specifications
      .filter((item) => item?.name && item?.value)
      .slice(0, limit)
      .map((item) => `${item.name}: ${item.value}`);
  }

  return String(product.keySpecs || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function availabilityLabel(product) {
  if (product.availability === "InStock") return uiText("Còn hàng", "In stock");
  if (product.availability === "OutOfStock") return uiText("Hết hàng", "Out of stock");
  return uiText("Cần kiểm tra", "Needs checking");
}

function getSpecValue(product, aliases = []) {
  const normalizedAliases = aliases.map(normalizeCatalogText);
  const specs = Array.isArray(product.specifications) ? product.specifications : [];
  const found = specs.find((item) => normalizedAliases.includes(normalizeCatalogText(item?.name)));
  if (found?.value) return found.value;

  return productKeySpecs(product, 16)
    .map((line) => {
      const [name, ...rest] = String(line).split(":");
      return { name: normalizeCatalogText(name), value: rest.join(":").trim() };
    })
    .find((item) => normalizedAliases.includes(item.name))?.value || "";
}

function isLaptopProduct(product) {
  const searchText = productSearchText(product);
  return product.categorySlug === "laptop" || hasAnyCatalogKeyword(searchText, ["laptop", "may tinh xach tay"]);
}

function hasDedicatedLaptopGpu(product) {
  if (!isLaptopProduct(product)) return false;
  const graphicsText = normalizeCatalogText([
    getSpecValue(product, ["chip do hoa", "vga", "card do hoa", "gpu"]),
    product.name,
    product.description,
    product.keySpecs,
  ].join(" "));
  const hasDedicated = hasAnyCatalogKeyword(graphicsText, [
    "rtx",
    "gtx",
    "geforce",
    "radeon rx",
    "arc a",
    "arc b",
    "nvidia",
  ]);
  return hasDedicated;
}

function inferLaptopUseTypeFromText(text) {
  const normalized = normalizeCatalogText(text);
  if (hasAnyCatalogKeyword(normalized, ["gaming", "choi game", "rtx", "gtx", "vga roi", "card roi", "card do hoa roi"])) {
    return "gaming";
  }
  if (hasAnyCatalogKeyword(normalized, ["van phong", "office", "mong nhe", "sinh vien", "hoc tap", "excel", "khong card roi", "khong vga roi"])) {
    return "office";
  }
  return "";
}

function laptopTypeLabel(product) {
  if (!isLaptopProduct(product)) return "";
  return hasDedicatedLaptopGpu(product)
    ? uiText("Laptop gaming", "Gaming laptop")
    : uiText("Laptop văn phòng", "Office laptop");
}

function formatCatalogDate(value) {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPolicyPrompt(text) {
  const normalized = normalizeCatalogText(text);
  return ["bao hanh", "doi tra", "giao hang", "tra gop", "hoa don", "vat", "hotline", "don hang", "ship"]
    .some((keyword) => normalized.includes(keyword));
}

function isComparePrompt(text) {
  const normalized = normalizeCatalogText(text);
  return ["so sanh", "compare", "chon giua", "khac nhau"].some((keyword) => normalized.includes(keyword));
}

function isCatalogIntent(text) {
  if (isPolicyPrompt(text)) return false;
  const normalized = normalizeCatalogText(text);
  if (parseBudgetFromText(text)) return true;
  if (/\bsku\s*\d+/i.test(text)) return true;

  return [
    "tu van",
    "tim",
    "mua",
    "goi y",
    "recommend",
    "buy",
    "mac",
    "macbook",
    "apple",
    "laptop",
    "pc",
    "may tinh",
    "man hinh",
    "chuot",
    "mouse",
    "ban phim",
    "keyboard",
    "tai nghe",
    "headphone",
    "headset",
    "may in",
    "printer",
    "ram",
    "ssd",
    "vga",
    "gaming",
    "so sanh",
  ].some((keyword) => normalized.includes(keyword));
}

function inferCategoryFromText(text) {
  const normalized = normalizeCatalogText(text);
  if (hasAnyCatalogKeyword(normalized, ["mac", "macbook", "mac mini", "imac", "iphone", "ipad", "apple"])) return "san-pham-apple";
  if (hasAnyCatalogKeyword(normalized, ["laptop", "may tinh xach tay"])) return "laptop";
  const rules = [
    ["san-pham-apple", ["mac", "macbook", "mac mini", "imac", "iphone", "ipad", "apple"]],
    ["may-tinh-de-ban", ["pc", "may tinh ban", "desktop pc", "build pc"]],
    ["man-hinh-may-tinh", ["man hinh", "monitor", "144hz", "2k", "4k"]],
    ["h-gaming-gear", ["gaming gear", "chuot gaming", "ban phim gaming", "tai nghe gaming"]],
    ["phu-kien-pc", ["phu kien pc", "chuot", "mouse", "ban phim", "keyboard", "lot chuot", "mousepad"]],
    ["thiet-bi-van-phong", ["may in", "van phong", "muc in"]],
    ["thiet-bi-am-thanh", ["tai nghe", "headphone", "headset", "loa", "speaker"]],
    ["linh-kien-may-tinh", ["cpu", "ram", "ssd", "hdd", "vga", "card man hinh", "mainboard", "nguon", "case"]],
    ["laptop", ["laptop", "hoc lap trinh", "sinh vien", "van phong", "gaming"]],
  ];
  return rules.find(([, words]) => hasAnyCatalogKeyword(normalized, words))?.[0] || "";
}

function catalogSlugFromMenuKey(menuKey) {
  const map = {
    laptop: "laptop",
    apple: "san-pham-apple",
    appliance: "dien-may-dien-gia-dung",
    home: "do-gia-dung",
    pc: "may-tinh-de-ban",
    monitor: "man-hinh-may-tinh",
    components: "linh-kien-may-tinh",
    "computer-accessories": "phu-kien-pc",
    gaming: "h-gaming-gear",
    mobile: "dien-thoai-may-tinh-bang-phu-kien",
    accessories: "phu-kien-chung",
    audio: "thiet-bi-am-thanh",
    office: "thiet-bi-van-phong",
    business: "giai-phap-doanh-nghiep",
    clearance: "hang-thanh-ly",
  };
  return map[menuKey] || menuKey || "";
}


function inferNeedFromText(text) {
  const normalized = normalizeCatalogText(text);
  if (normalized.includes("hoc lap trinh")) return uiText("Học lập trình", "Programming");
  if (normalized.includes("sinh vien") || normalized.includes("hoc tap")) return uiText("Học tập", "Study");
  if (normalized.includes("gaming") || normalized.includes("choi game")) return "Gaming";
  if (normalized.includes("do hoa") || normalized.includes("render")) return uiText("Đồ họa", "Graphics");
  if (normalized.includes("van phong") || normalized.includes("excel")) return uiText("Văn phòng", "Office work");
  return "";
}

function parseBudgetFromText(text) {
  const normalized = normalizeCatalogText(text);
  const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:-|den|toi)\s*(\d+(?:\.\d+)?)\s*(?:trieu|tr|m)/);
  if (rangeMatch) {
    return {
      min: Number(rangeMatch[1]) * 1000000,
      max: Number(rangeMatch[2]) * 1000000,
      strictMax: true,
    };
  }

  const thousandRangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:-|den|toi)\s*(\d+(?:\.\d+)?)\s*(?:k|nghin|ngan)/);
  if (thousandRangeMatch) {
    return {
      min: Number(thousandRangeMatch[1]) * 1000,
      max: Number(thousandRangeMatch[2]) * 1000,
      strictMax: true,
    };
  }

  const strictBudget = [
    "duoi",
    "toi da",
    "under",
    "chi co",
    "ngan sach toi da",
    "budget toi chi co",
    "budget chi co",
  ].some((keyword) => normalized.includes(keyword));

  const thousandMatch = normalized.match(/(?:duoi|toi da|tam|khoang|under)?\s*(\d+(?:\.\d+)?)\s*(?:k|nghin|ngan)/);
  if (thousandMatch) {
    const amount = Number(thousandMatch[1]) * 1000;
    if (strictBudget) return { min: 0, max: amount, strictMax: true };
    if (normalized.includes("tren")) return { min: amount, max: 999999999 };

    const delta = Math.max(50000, amount * 0.2);
    return { min: Math.max(0, amount - delta), max: amount + delta, strictMax: false };
  }

  const millionMatch = normalized.match(/(?:duoi|toi da|tam|khoang|under)?\s*(\d+(?:\.\d+)?)\s*(?:trieu|tr|m)/);
  if (!millionMatch) return null;

  const amount = Number(millionMatch[1]) * 1000000;

  if (strictBudget) {
    return { min: 0, max: amount, strictMax: true };
  }
  if (normalized.includes("tren")) {
    return { min: amount, max: 999999999 };
  }
  return { min: Math.max(0, amount - 3000000), max: amount + 3000000, strictMax: false };
}

function parseBudgetFilter(value) {
  if (!value) return null;
  const [min, max] = value.split("-").map(Number);
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max, strictMax: true } : null;
}

function getBudgetRange() {
  return parseBudgetFilter(catalogState.selectedBudget) || parseBudgetFromText(catalogState.query);
}

function isProductInBudget(product, budget, allowNear = false) {
  if (!budget || !Number.isFinite(Number(product.price))) return true;
  const price = Number(product.price);
  const max = allowNear && !budget.strictMax ? budget.max * 1.15 : budget.max;
  return price >= budget.min && price <= max;
}

function scoreProduct(product, query, options = {}) {
  const normalizedQuery = normalizeCatalogText(query);
  const searchText = productSearchText(product);
  const productName = normalizeCatalogText(product.name);
  const terms = normalizedQuery.split(" ").filter((term) => term.length > 1);
  let score = 0;

  for (const term of terms) {
    if (searchText.includes(term)) score += 2;
    if (productName.includes(term)) score += 2;
    if (normalizeCatalogText(product.brand).includes(term)) score += 1;
  }

  const wantsMouse = hasAnyCatalogKeyword(normalizedQuery, ["chuot", "mouse"]);
  const wantsMousepad = hasAnyCatalogKeyword(normalizedQuery, ["lot chuot", "mousepad", "mouse mat"]);
  const isMousepad = hasAnyCatalogKeyword(productName, ["lot chuot", "tam lot chuot", "mieng lot chuot", "mousepad", "mouse mat"]);
  if (wantsMouse && !wantsMousepad && isMousepad) score -= 8;

  const laptopUseType = inferLaptopUseTypeFromText(`${query} ${options.need || ""}`);
  if (laptopUseType && isLaptopProduct(product)) {
    const hasDedicatedGpu = hasDedicatedLaptopGpu(product);
    if (laptopUseType === "gaming") score += hasDedicatedGpu ? 10 : -10;
    if (laptopUseType === "office") score += hasDedicatedGpu ? -8 : 8;
  }

  if (options.category && product.categorySlug === options.category) score += 8;
  if (product.availability === "InStock") score += 4;
  if (catalogState.shortlistedSkus.has(product.sku)) score += 2;

  const budget = options.budget;
  if (budget && Number.isFinite(Number(product.price))) {
    if (isProductInBudget(product, budget)) score += 7;
    else if (isProductInBudget(product, budget, true)) score += 3;
    else score -= 6;
  }

  if (options.need && searchText.includes(normalizeCatalogText(options.need))) score += 4;
  return score;
}

function filterCatalogProducts() {
  const budget = getBudgetRange();
  const queryCategory = inferCategoryFromText(catalogState.query);
  const category = queryCategory || catalogState.selectedCategory;
  const query = catalogState.query;
  const normalizedQuery = normalizeCatalogText(query);
  const laptopUseType = inferLaptopUseTypeFromText(query || catalogState.userNeed);

  let products = catalogState.products.filter((product) => {
    if (category && product.categorySlug !== category) return false;
    if (category === "laptop" && laptopUseType === "gaming" && !hasDedicatedLaptopGpu(product)) return false;
    if (category === "laptop" && laptopUseType === "office" && hasDedicatedLaptopGpu(product)) return false;
    if (budget && !isProductInBudget(product, budget, true)) return false;
    if (!normalizedQuery) return true;
    return scoreProduct(product, query, { category, budget, need: catalogState.userNeed }) > 0;
  });

  products = products
    .map((product) => ({
      product,
      score: scoreProduct(product, query, { category, budget, need: catalogState.userNeed }),
    }))
    .sort((a, b) => {
      const stockDelta = Number(b.product.availability === "InStock") - Number(a.product.availability === "InStock");
      return stockDelta || b.score - a.score || Number(a.product.price || 0) - Number(b.product.price || 0);
    })
    .map((item) => item.product);

  const hasActiveFilter = Boolean(category || budget || normalizedQuery);
  catalogState.visibleProducts = products.length || hasActiveFilter ? products : catalogState.products.slice(0, 12);
}

function categoryName(slug) {
  return catalogState.products.find((product) => product.categorySlug === slug)?.categoryName || slug || "Tất cả";
}

function updateKpiPanel() {
  document.querySelectorAll("[data-kpi]").forEach((element) => {
    element.textContent = String(kpiCounts[element.dataset.kpi] || 0);
  });
}

function rememberLocalSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set].slice(-40)));
}

function persistCompareSelection() {
  rememberLocalSet("pv-shortlisted-skus", catalogState.shortlistedSkus);
  renderContextChips();
}

function clearCatalogIntentContext() {
  catalogState.query = "";
  catalogState.userNeed = "";
  catalogState.selectedBudget = "";
  if (catalogSearchInput) catalogSearchInput.value = "";
  if (catalogBudgetFilter) catalogBudgetFilter.value = "";
}

function beginCompareSelection(product, source = "compare_button") {
  if (!product) return { ready: false, reset: false };

  const hadFullPair = catalogState.shortlistedSkus.size >= 2;
  const alreadySelected = catalogState.shortlistedSkus.has(product.sku);
  let reset = false;

  if (catalogState.shortlistedSkus.size > 2 || (hadFullPair && !alreadySelected)) {
    catalogState.shortlistedSkus.clear();
    clearCatalogIntentContext();
    reset = true;
  }

  catalogState.shortlistedSkus.add(product.sku);
  catalogState.focusedSku = product.sku;
  catalogState.selectedCategory = product.categorySlug || catalogState.selectedCategory;
  if (catalogCategoryFilter && product.categorySlug) catalogCategoryFilter.value = product.categorySlug;
  catalogState.viewedSkus.add(product.sku);
  rememberLocalSet("pv-viewed-skus", catalogState.viewedSkus);
  persistCompareSelection();
  renderCatalogProducts();
  trackEvent("shortlist_added", { sku: product.sku, source, reset });

  return {
    ready: catalogState.shortlistedSkus.size >= 2,
    reset,
  };
}

function pushEventStream(eventName, payload = {}) {
  const label = `${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · ${eventName}${payload.sku ? ` · ${payload.sku}` : ""}`;
  catalogState.events.unshift(label);
  catalogState.events = catalogState.events.slice(0, 7);
  if (!eventStream) return;
  eventStream.innerHTML = catalogState.events.map((event) => `<li>${escapeHtml(event)}</li>`).join("");
}

function trackEvent(eventName, payload = {}) {
  kpiCounts[eventName] = (kpiCounts[eventName] || 0) + 1;
  localStorage.setItem("pv-kpi-counts", JSON.stringify(kpiCounts));
  updateKpiPanel();
  pushEventStream(eventName, payload);

  const eventPayload = {
    eventName,
    sessionId: assistantSessionId,
    anonymousUserId,
    timestamp: new Date().toISOString(),
    payload: {
      ...payload,
      currentCategory: catalogState.selectedCategory,
      query: catalogState.query,
    },
  };

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventPayload),
    keepalive: true,
  }).catch(() => {
    console.info("Tracking fallback:", eventPayload);
  });
}

function renderContextChips() {
  const budget = getBudgetRange();
  const chips = [];
  if (catalogState.selectedCategory) chips.push(`${uiText("Danh mục", "Category")}: ${categoryName(catalogState.selectedCategory)}`);
  if (catalogState.query) chips.push(`Query: ${compactText(catalogState.query, 34)}`);
  if (budget) chips.push(`${uiText("Ngân sách", "Budget")}: ${formatVnd(budget.min)} - ${formatVnd(budget.max)}`);
  if (catalogState.userNeed) chips.push(`${uiText("Nhu cầu", "Need")}: ${localizeNeedText(catalogState.userNeed)}`);
  if (catalogState.shortlistedSkus.size) chips.push(`Shortlist: ${catalogState.shortlistedSkus.size}`);

  const html = (chips.length ? chips : [uiText("Chưa có nhu cầu", "No active need")]).map((chip) => `<span>${escapeHtml(chip)}</span>`).join("");
  if (contextChips) contextChips.innerHTML = html;
  if (assistantContextBar) assistantContextBar.innerHTML = html;
}

function renderCatalogProducts() {
  if (!catalogResults) return;
  filterCatalogProducts();
  const products = catalogState.visibleProducts.slice(0, 12);

  if (catalogCount) {
    catalogCount.textContent = uiText(`${catalogState.visibleProducts.length} sản phẩm phù hợp`, `${catalogState.visibleProducts.length} matching products`);
  }
  if (catalogContext) {
    const context = [
      catalogState.selectedCategory ? categoryName(catalogState.selectedCategory) : uiText("Tất cả danh mục", "All categories"),
      catalogState.query ? `"${catalogState.query}"` : uiText("chưa có query", "no query yet"),
    ].join(" · ");
    catalogContext.textContent = context;
  }

  if (!products.length) {
    catalogResults.innerHTML = `
      <div class="catalog-empty-state">
        <strong>${uiText("Chưa có sản phẩm khớp điều kiện", "No products match these conditions")}</strong>
        <p>${uiText("Thử nới ngân sách, đổi danh mục hoặc gửi lead để sales kiểm tra thêm mẫu phù hợp.", "Try widening the budget, changing category, or sending a lead so sales can check more suitable options.")}</p>
      </div>
    `;
    renderContextChips();
    return;
  }

  catalogResults.innerHTML = products.map((product) => {
    const specs = productKeySpecs(product, 3).map((spec) => `<p>${escapeHtml(compactText(spec, 84))}</p>`).join("");
    const laptopBadge = laptopTypeLabel(product);
    return `
      <article class="catalog-product-card${catalogState.focusedSku === product.sku ? " is-focused" : ""}" data-sku="${escapeHtml(product.sku)}">
        <img src="${escapeHtml(product.image || "assets/images/logos/logo.svg")}" alt="${escapeHtml(product.name)}" loading="lazy">
        <div class="catalog-card-meta">
          <span class="product-badge">${escapeHtml(product.brand || "Phong Vũ")}</span>
          <span class="product-badge">${escapeHtml(availabilityLabel(product))}</span>
          ${laptopBadge ? `<span class="product-badge">${escapeHtml(laptopBadge)}</span>` : ""}
        </div>
        <h3>${escapeHtml(compactText(product.name, 82))}</h3>
        <strong>${escapeHtml(product.priceFormatted || formatVnd(product.price))}</strong>
        <div>${specs || `<p>${escapeHtml(compactText(product.description, 110))}</p>`}</div>
        <div class="catalog-card-actions">
          <button type="button" data-action="detail" data-sku="${escapeHtml(product.sku)}">${uiText("Chi tiết", "Details")}</button>
          <button type="button" data-action="ask" data-sku="${escapeHtml(product.sku)}">${uiText("Hỏi AI", "Ask AI")}</button>
          <button type="button" data-action="compare" data-sku="${escapeHtml(product.sku)}">${uiText("So sánh", "Compare")}</button>
          <button type="button" data-action="shortlist" data-sku="${escapeHtml(product.sku)}">${catalogState.shortlistedSkus.has(product.sku) ? uiText("Đã chọn", "Selected") : "Shortlist"}</button>
          <button type="button" data-action="cart" data-sku="${escapeHtml(product.sku)}">${uiText("Thêm vào giỏ demo", "Add to demo cart")}</button>
        </div>
      </article>
    `;
  }).join("");

  renderContextChips();
}

function populateCatalogFilters() {
  if (!catalogCategoryFilter) return;
  const options = [...new Map(catalogState.products.map((product) => [product.categorySlug, product.categoryName])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "vi"));
  catalogCategoryFilter.innerHTML = `<option value="">${uiText("Tất cả danh mục", "All categories")}</option>${options
    .map(([slug, name]) => `<option value="${escapeHtml(slug)}">${escapeHtml(name)}</option>`)
    .join("")}`;
}

function scrollToCatalog() {
  catalogWorkspace?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

function applyCatalogSearch(value, options = {}) {
  catalogState.query = value.trim();
  catalogState.userNeed = inferNeedFromText(catalogState.query);
  const inferredCategory = inferCategoryFromText(catalogState.query);
  if (inferredCategory && catalogState.selectedCategory !== inferredCategory) {
    catalogState.selectedCategory = inferredCategory;
    if (catalogCategoryFilter) catalogCategoryFilter.value = inferredCategory;
  }
  if (catalogSearchInput) catalogSearchInput.value = catalogState.query;
  renderCatalogProducts();
  if (catalogState.query && options.track !== false) {
    trackEvent("search_submitted", { query: catalogState.query, source: options.source || "store" });
  }
  if (options.scroll !== false) scrollToCatalog();
}

function applyCatalogCategory(category, options = {}) {
  catalogState.selectedCategory = category || "";
  if (catalogCategoryFilter) catalogCategoryFilter.value = catalogState.selectedCategory;
  renderCatalogProducts();
  trackEvent("category_selected", { categorySlug: catalogState.selectedCategory, source: options.source || "category_menu" });
  if (options.scroll !== false) scrollToCatalog();
}

function getProductBySku(sku) {
  return catalogState.products.find((product) => product.sku === sku);
}

function renderProductDetail(product, source = "catalog_card") {
  if (!productDetailPanel || !product) return;

  const specs = productKeySpecs(product, 9)
    .map((spec) => `<li>${escapeHtml(spec)}</li>`)
    .join("");
  const warranty = getSpecValue(product, ["bao hanh", "warranty"]) || uiText("Theo catalog", "According to catalog");

  productDetailPanel.hidden = false;
  productDetailPanel.innerHTML = `
    <div class="detail-drawer-header">
      <div>
        <span>${uiText("Chi tiết sản phẩm", "Product detail")}</span>
        <h3>${escapeHtml(product.name)}</h3>
      </div>
      <button type="button" data-close-detail aria-label="${uiText("Đóng chi tiết", "Close detail")}">×</button>
    </div>
    <div class="detail-drawer-body">
      <img src="${escapeHtml(product.image || "assets/images/logos/logo.svg")}" alt="${escapeHtml(product.name)}" loading="lazy">
      <dl>
        <div><dt>SKU</dt><dd>${escapeHtml(product.sku)}</dd></div>
        <div><dt>${uiText("Giá", "Price")}</dt><dd>${escapeHtml(product.priceFormatted || formatVnd(product.price))}</dd></div>
        <div><dt>${uiText("Tồn kho", "Stock")}</dt><dd>${escapeHtml(availabilityLabel(product))}</dd></div>
        <div><dt>${uiText("Bảo hành", "Warranty")}</dt><dd>${escapeHtml(warranty)}</dd></div>
        <div><dt>Catalog scrape</dt><dd>${escapeHtml(formatCatalogDate(product.scrapedAt))}</dd></div>
      </dl>
      <ul>${specs}</ul>
      <div class="detail-drawer-actions">
        <button type="button" data-detail-action="ask" data-sku="${escapeHtml(product.sku)}">${uiText("Hỏi AI về sản phẩm", "Ask AI about this product")}</button>
        <button type="button" data-detail-action="compare" data-sku="${escapeHtml(product.sku)}">${uiText("Đưa vào so sánh", "Add to comparison")}</button>
        <a href="${escapeHtml(product.productUrl || "#")}" target="_blank" rel="noreferrer">${uiText("Mở trang Phong Vũ", "Open Phong Vu page")}</a>
      </div>
    </div>
  `;

  catalogState.focusedSku = product.sku;
  catalogState.viewedSkus.add(product.sku);
  rememberLocalSet("pv-viewed-skus", catalogState.viewedSkus);
  renderContextChips();
  trackEvent("product_detail_opened", { sku: product.sku, source });
  productDetailPanel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
}

function ensureCompareSelection() {
  if (catalogState.shortlistedSkus.size >= 2) return;

  const category = catalogState.selectedCategory || inferCategoryFromText(catalogState.query);
  const sameCategory = category ? catalogState.products.filter((product) => product.categorySlug === category) : [];
  const pool = [
    ...(catalogState.visibleProducts.length ? catalogState.visibleProducts : []),
    ...sameCategory,
    ...catalogState.products,
  ];
  const uniquePool = [...new Map(pool.map((product) => [product.sku, product])).values()];
  const candidates = uniquePool
    .filter((product) => product.availability === "InStock")
    .concat(uniquePool.filter((product) => product.availability !== "InStock"));

  for (const product of candidates) {
    if (catalogState.shortlistedSkus.size >= 2) break;
    catalogState.shortlistedSkus.add(product.sku);
  }

  rememberLocalSet("pv-shortlisted-skus", catalogState.shortlistedSkus);
  renderCatalogProducts();
}

function focusProduct(sku) {
  const product = getProductBySku(sku);
  if (!product) return;
  catalogState.focusedSku = sku;
  catalogState.viewedSkus.add(sku);
  rememberLocalSet("pv-viewed-skus", catalogState.viewedSkus);
  catalogState.selectedCategory = product.categorySlug;
  if (catalogCategoryFilter) catalogCategoryFilter.value = product.categorySlug;
  renderCatalogProducts();
  scrollToCatalog();
  window.setTimeout(() => {
    document.querySelector(`.catalog-product-card[data-sku="${CSS.escape(sku)}"]`)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }, 80);
  trackEvent("product_viewed", { sku, source: "recommendation_or_card" });
}

function buildChatContext(prompt = "") {
  const isComparison = isComparePrompt(prompt);
  const budget = isComparison ? null : getBudgetRange();
  const promptCategory = isComparison ? "" : inferCategoryFromText(prompt);
  const queryCategory = isComparison ? "" : inferCategoryFromText(catalogState.query);
  return {
    currentCategory: promptCategory || queryCategory || catalogState.selectedCategory,
    searchQuery: isComparison ? "" : catalogState.query,
    viewedProductSkus: [...catalogState.viewedSkus].slice(-8),
    shortlistedProductSkus: [...catalogState.shortlistedSkus].slice(-2),
    budgetRange: budget,
    userNeed: isComparison ? "" : localizeNeedText(catalogState.userNeed),
    language: currentLanguage,
  };
}

function setAssistantOpen(isOpen) {
  if (!assistantPanel || !assistantToggle) return;

  const wasOpen = document.body.classList.contains("assistant-split-open");
  document.body.classList.toggle("assistant-split-open", isOpen);
  assistantPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  assistantToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

  if (isOpen) {
    if (!wasOpen) trackEvent("split_chat_opened", { source: "chat_icon" });
    window.setTimeout(() => assistantInput?.focus(), 120);
  } else {
    setMobileSplitView("chat");
  }
}

function setMobileSplitView(view = "chat") {
  document.body.classList.toggle("assistant-mobile-store", view === "store");
  mobileSplitTabs?.querySelectorAll("[data-mobile-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mobileView === view);
  });
}

function openLeadForm(source = "assistant") {
  if (!leadForm) return;
  setAssistantOpen(true);
  setMobileSplitView("chat");
  leadForm.hidden = false;
  trackEvent("handoff_requested", { source });
  trackEvent("lead_form_opened", { source });
}

function addChatMessage(text, type = "bot") {
  if (!assistantBody) return null;

  const message = document.createElement("p");
  message.className = `chat-message ${type}`;
  message.textContent = text;
  assistantBody.append(message);
  assistantBody.scrollTop = assistantBody.scrollHeight;
  return message;
}

function recommendationReasons(product) {
  const reasons = [];
  if (product.availability === "InStock") reasons.push(uiText("Đang còn hàng theo catalog demo", "In stock in the demo catalog"));
  if (Number.isFinite(Number(product.price))) reasons.push(uiText(`Giá ${product.priceFormatted || formatVnd(product.price)}`, `Price ${product.priceFormatted || formatVnd(product.price)}`));
  reasons.push(...productKeySpecs(product, 2));
  return reasons.slice(0, 3);
}

function renderRecommendations(recommendations = []) {
  if (!assistantBody || !recommendations.length) return;
  const wrapper = document.createElement("div");
  wrapper.className = "chat-recommendations";
  wrapper.innerHTML = recommendations.slice(0, 4).map((item) => {
    const product = getProductBySku(item.sku) || item;
    const reasons = item.reasons || recommendationReasons(product);
    return `
      <article class="recommendation-card" data-recommendation-sku="${item.sku}">
        <img src="${escapeHtml(item.image || product.image || "assets/images/logos/logo.svg")}" alt="${escapeHtml(item.name || product.name)}" loading="lazy">
        <div>
          <h4>${escapeHtml(compactText(item.name || product.name, 72))}</h4>
          <strong>${escapeHtml(item.priceFormatted || product.priceFormatted || formatVnd(product.price))}</strong>
          <p>${escapeHtml(compactText(reasons.join(" · "), 120))}</p>
          <div class="recommendation-actions">
            <button type="button" data-reco-action="view" data-sku="${escapeHtml(item.sku)}">${uiText("Xem trong store", "View in store")}</button>
            <button type="button" data-reco-action="detail" data-sku="${escapeHtml(item.sku)}">${uiText("Chi tiết", "Details")}</button>
            <button type="button" data-reco-action="ask" data-sku="${escapeHtml(item.sku)}">${uiText("Hỏi tiếp", "Ask more")}</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
  assistantBody.append(wrapper);
  assistantBody.scrollTop = assistantBody.scrollHeight;
}

function renderComparison(comparison) {
  if (!assistantBody || !comparison?.items?.length) return;

  const fields = [
    [uiText("Giá", "Price"), "priceFormatted"],
    [uiText("Tồn kho", "Stock"), "availability"],
    [uiText("Bảo hành", "Warranty"), "warranty"],
    ["CPU", "cpu"],
    ["RAM", "ram"],
    [uiText("Lưu trữ", "Storage"), "storage"],
    [uiText("Màn hình", "Display"), "screen"],
    [uiText("Đồ họa", "Graphics"), "graphics"],
    ["AI/NPU", "npu"],
    [uiText("Phù hợp", "Best for"), "need"],
    [uiText("Ưu điểm", "Pros"), "pros"],
    [uiText("Nhược điểm", "Cons"), "cons"],
  ];

  const renderCell = (value) => {
    if (Array.isArray(value)) {
      return value.length
        ? `<ul>${value.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : uiText("Cần kiểm tra", "Needs checking");
    }
    return escapeHtml(value || uiText("Cần kiểm tra", "Needs checking"));
  };

  const wrapper = document.createElement("div");
  wrapper.className = "chat-comparison";
  wrapper.innerHTML = `
    <strong>${escapeHtml(comparison.title || uiText("So sánh nhanh", "Quick comparison"))}</strong>
    <div class="comparison-table-wrap">
      <table>
        <thead>
          <tr>
            <th>${uiText("Tiêu chí", "Criteria")}</th>
            ${comparison.items.map((item) => `<th>${escapeHtml(compactText(item.name, 42))}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${fields.map(([label, key]) => `
            <tr>
              <th>${escapeHtml(label)}</th>
              ${comparison.items.map((item) => `<td>${renderCell(item[key])}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <p>${escapeHtml(comparison.recommendation || "")}</p>
  `;

  assistantBody.append(wrapper);
  assistantBody.scrollTop = assistantBody.scrollHeight;
}

async function sendAssistantPrompt(text) {
  const value = text.trim();
  if (!value || assistantIsSending) return;

  setAssistantOpen(true);
  setMobileSplitView("chat");
  const shouldSyncStore = isCatalogIntent(value);
  if (shouldSyncStore && !isComparePrompt(value)) {
    applyCatalogSearch(value, { fromAssistant: true, source: "assistant", scroll: false });
  }
  assistantIsSending = true;
  if (assistantInput) assistantInput.disabled = true;
  addChatMessage(value, "user");
  const pendingMessage = addChatMessage(uiText("Đang trả lời...", "Thinking..."), "bot");
  trackEvent("chat_message_sent", { messageLength: value.length });

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: value,
        sessionId: assistantSessionId,
        anonymousUserId,
        language: currentLanguage,
        context: buildChatContext(value),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === "OPENAI_QUOTA_EXCEEDED") throw new Error("OPENAI_QUOTA_EXCEEDED");
      if (data.error === "OPENAI_RATE_LIMITED") throw new Error("OPENAI_RATE_LIMITED");
      if (data.error === "OPENAI_NOT_CONFIGURED" || data.error === "SUPABASE_NOT_CONFIGURED") throw new Error("CHAT_NOT_CONFIGURED");
      throw new Error(data.error || data.detail || "Chat API failed");
    }

    if (data.sessionId) {
      assistantSessionId = data.sessionId;
      localStorage.setItem("pv-assistant-session-id", assistantSessionId);
    }

    if (pendingMessage) {
      pendingMessage.textContent = data.reply || uiText("Mình chưa có câu trả lời phù hợp. Bạn thử hỏi lại giúp mình nhé.", "I do not have a reliable answer yet. Please try again with a bit more detail.");
    }

    if (data.comparison) {
      renderComparison(data.comparison);
      trackEvent("comparison_returned", { count: data.comparison.items?.length || 0, source: data.source || "chat" });
    }

    if (data.recommendations?.length) {
      renderRecommendations(data.recommendations);
      trackEvent("catalog_recommendation_returned", { count: data.recommendations.length, source: data.source || "chat" });
    } else if (data.source === "openai" || String(data.source || "").startsWith("ai_")) {
      trackEvent("openai_answered", { source: data.source || "openai" });
    }
  } catch (error) {
    if (pendingMessage) {
      pendingMessage.textContent = error.message === "CHAT_NOT_CONFIGURED"
        ? uiText("AI API chưa được cấu hình. Cần OPENAI_API_KEY để AI đọc catalog/policy và trả lời.", "The AI API is not configured yet. Add OPENAI_API_KEY so the assistant can read catalog and policy data.")
        : uiText("AI chưa trả lời được lúc này. Bạn thử lại sau vài giây hoặc chuyển sales để được hỗ trợ nhanh.", "The AI could not answer right now. Please try again in a few seconds or hand off to sales for quick support.");
    }
    trackEvent("unanswered_intent", { query: value, source: "ai_error" });
    console.error("Assistant chat error:", error);
  } finally {
    assistantIsSending = false;
    if (assistantInput) {
      assistantInput.disabled = false;
      assistantInput.focus();
    }
  }
}

assistantToggle?.addEventListener("click", () => {
  trackEvent("chat_icon_clicked", { source: "floating_icon" });
  setAssistantOpen(!document.body.classList.contains("assistant-split-open"));
});

assistantClose?.addEventListener("click", () => setAssistantOpen(false));

assistantResize?.addEventListener("click", () => {
  document.body.classList.toggle("assistant-compact");
  assistantResize.setAttribute(
    "aria-label",
    document.body.classList.contains("assistant-compact")
      ? uiText("Mở rộng khung chat", "Expand chat panel")
      : uiText("Thu gọn khung chat", "Compact chat panel"),
  );
});

mobileSplitTabs?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mobile-view]");
  if (!button) return;
  setMobileSplitView(button.dataset.mobileView);
  trackEvent("mobile_split_tab_clicked", { view: button.dataset.mobileView });
});

assistantForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = assistantInput?.value.trim() || "";
  sendAssistantPrompt(value);
  if (assistantInput) assistantInput.value = "";
});

document.querySelectorAll(".chat-suggestions button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.hasAttribute("data-open-lead")) {
      openLeadForm("quick_prompt");
      return;
    }
    if (isComparePrompt(button.textContent || "")) {
      ensureCompareSelection();
    }
    sendAssistantPrompt(button.textContent || "");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setAssistantOpen(false);
});

headerSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = event.currentTarget.querySelector("input").value.trim();
  if (value) applyCatalogSearch(value, { source: "header_search" });
});

catalogSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  applyCatalogSearch(catalogSearchInput?.value || "", { source: "catalog_search" });
});

catalogCategoryFilter?.addEventListener("change", () => {
  applyCatalogCategory(catalogCategoryFilter.value, { source: "catalog_filter" });
});

catalogBudgetFilter?.addEventListener("change", () => {
  catalogState.selectedBudget = catalogBudgetFilter.value;
  renderCatalogProducts();
  trackEvent("search_submitted", { budget: catalogState.selectedBudget, source: "budget_filter" });
});

catalogAiPrompt?.addEventListener("click", () => {
  const prompt = catalogState.query || uiText("Gợi ý laptop văn phòng dưới 18 triệu", "Recommend an office laptop under 18 million VND");
  sendAssistantPrompt(prompt);
});

catalogResults?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const sku = button.dataset.sku;
  const product = getProductBySku(sku);
  if (!product) return;

  if (button.dataset.action === "detail") {
    renderProductDetail(product, "catalog_card");
  }

  if (button.dataset.action === "ask") {
    focusProduct(sku);
    sendAssistantPrompt(uiText(`Tư vấn sản phẩm ${product.name} SKU ${sku}`, `Give me advice for ${product.name} SKU ${sku}`));
  }

  if (button.dataset.action === "compare") {
    const compareState = beginCompareSelection(product, "compare_button");
    if (compareState.ready) {
      sendAssistantPrompt(uiText("So sánh 2 sản phẩm đang xem", "Compare the 2 viewed products"));
    } else {
      setAssistantOpen(true);
      addChatMessage(uiText(
        `${compareState.reset ? "Mình đã làm mới cặp so sánh. " : ""}Đã chọn "${compactText(product.name, 64)}". Chọn thêm một sản phẩm nữa để mình dựng bảng so sánh.`,
        `${compareState.reset ? "I refreshed the comparison pair. " : ""}Selected "${compactText(product.name, 64)}". Pick one more product and I will build the comparison table.`,
      ), "bot");
    }
  }

  if (button.dataset.action === "shortlist") {
    catalogState.shortlistedSkus.add(sku);
    rememberLocalSet("pv-shortlisted-skus", catalogState.shortlistedSkus);
    renderCatalogProducts();
    trackEvent("shortlist_added", { sku });
  }

  if (button.dataset.action === "cart") {
    trackEvent("add_to_cart_demo", { sku, source: "catalog_card" });
    addChatMessage(uiText(
      `Đã ghi nhận "${compactText(product.name, 64)}" vào giỏ demo. Nếu muốn chốt nhanh, mình có thể chuyển sales gọi lại.`,
      `I added "${compactText(product.name, 64)}" to the demo cart. If you want to close quickly, I can hand this off to sales for a callback.`,
    ), "bot");
    setAssistantOpen(true);
  }
});

productDetailPanel?.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-close-detail]");
  if (closeButton) {
    productDetailPanel.hidden = true;
    return;
  }

  const actionButton = event.target.closest("[data-detail-action]");
  if (!actionButton) return;
  const product = getProductBySku(actionButton.dataset.sku);
  if (!product) return;

  if (actionButton.dataset.detailAction === "ask") {
    sendAssistantPrompt(uiText(`Tư vấn sản phẩm ${product.name} SKU ${product.sku}`, `Give me advice for ${product.name} SKU ${product.sku}`));
  }

  if (actionButton.dataset.detailAction === "compare") {
    const compareState = beginCompareSelection(product, "detail_drawer");
    if (compareState.ready) {
      sendAssistantPrompt(uiText("So sánh 2 sản phẩm đang xem", "Compare the 2 viewed products"));
    } else {
      setAssistantOpen(true);
      addChatMessage(uiText(
        `${compareState.reset ? "Mình đã làm mới cặp so sánh. " : ""}Đã đưa "${compactText(product.name, 64)}" vào so sánh. Chọn thêm một sản phẩm nữa để so sánh.`,
        `${compareState.reset ? "I refreshed the comparison pair. " : ""}Added "${compactText(product.name, 64)}" to comparison. Pick one more product to compare.`,
      ), "bot");
    }
  }
});

assistantBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-reco-action]");
  if (!button) return;
  const sku = button.dataset.sku;
  trackEvent("recommendation_clicked", { sku, action: button.dataset.recoAction });
  if (button.dataset.recoAction === "view") focusProduct(sku);
  if (button.dataset.recoAction === "detail") {
    const product = getProductBySku(sku);
    renderProductDetail(product, "recommendation_card");
    focusProduct(sku);
  }
  if (button.dataset.recoAction === "ask") {
    const product = getProductBySku(sku);
    sendAssistantPrompt(uiText(`So sánh và giải thích vì sao nên chọn ${product?.name || sku}`, `Compare and explain why I should choose ${product?.name || sku}`));
  }
});

document.querySelector("[data-close-lead]")?.addEventListener("click", () => {
  leadForm.hidden = true;
});

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const payload = {
    sessionId: assistantSessionId,
    anonymousUserId,
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    need: String(formData.get("need") || catalogState.query || catalogState.userNeed || uiText("Cần tư vấn sản phẩm", "Needs product advice")).trim(),
    preferredContactTime: String(formData.get("preferredContactTime") || "").trim(),
    budgetRange: getBudgetRange(),
    consent: formData.get("consent") === "on",
  };

  if (!payload.name || !payload.phone || !payload.consent) {
    addChatMessage(uiText("Bạn nhập tên, số điện thoại và tick đồng ý để mình chuyển sales nhé.", "Please enter your name and phone number, then tick consent so I can hand this off to sales."), "bot");
    return;
  }

  try {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.info("Lead fallback:", payload, error);
  }

  leadForm.reset();
  leadForm.hidden = true;
  trackEvent("lead_submitted", { source: "assistant_pane" });
  addChatMessage(uiText("Đã gửi yêu cầu cho sales. Trong demo này mình cũng ghi lại lead event để đo conversion assisted.", "I sent the request to sales. This demo also logs the lead event so we can measure assisted conversion."), "bot");
});

async function loadCatalogProducts() {
  try {
    const response = await fetch("data/phongvu-catalog/demo-products.json");
    if (!response.ok) throw new Error("Catalog not found");
    const products = await response.json();
    catalogState.products = products
      .filter((product) => product?.sku && product?.name)
      .map((product) => ({
        ...product,
        priceFormatted: product.priceFormatted || formatVnd(product.price),
    }));
    populateCatalogFilters();
    clearCatalogIntentContext();
    catalogState.selectedCategory = "laptop";
    if (catalogCategoryFilter) catalogCategoryFilter.value = "laptop";
    renderCatalogProducts();
    updateKpiPanel();
  } catch (error) {
    if (catalogCount) catalogCount.textContent = "Không tải được catalog demo";
    if (catalogContext) catalogContext.textContent = "Kiểm tra file data/phongvu-catalog/demo-products.json";
    console.error("Catalog load error:", error);
  }
}

loadCatalogProducts();
trackEvent("page_view", { path: window.location.pathname || "/" });

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => observer.observe(item));
restartAutoplay();

const heroLayout = document.querySelector(".hero-layout");
const categoryLinks = [...document.querySelectorAll(".category-menu [data-menu]")];
const megaMenu = document.querySelector("#categoryMegaMenu");

function renderMegaMenu(menuKey) {
  if (!megaMenu || !categoryMenus[menuKey]) return;

  const columns = categoryMenus[menuKey]
    .map(([title, ...items]) => `
      <section class="mega-column">
        <h3>${tr(title)}</h3>
        ${items.map((item) => `<a href="#">${tr(item)}</a>`).join("")}
      </section>
    `)
    .join("");

  megaMenu.innerHTML = `<div class="mega-grid">${columns}</div>`;
  megaMenu.setAttribute("aria-hidden", "false");
  heroLayout?.classList.add("mega-open");

  categoryLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.menu === menuKey);
  });
}

function closeMegaMenu() {
  megaMenu?.setAttribute("aria-hidden", "true");
  heroLayout?.classList.remove("mega-open");
  categoryLinks.forEach((link) => link.classList.remove("is-active"));
}

categoryLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => renderMegaMenu(link.dataset.menu));
  link.addEventListener("focus", () => renderMegaMenu(link.dataset.menu));
  link.addEventListener("click", (event) => {
    event.preventDefault();
    applyCatalogCategory(catalogSlugFromMenuKey(link.dataset.menu), { source: "hero_category_menu" });
  });
});

heroLayout?.addEventListener("mouseleave", closeMegaMenu);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMegaMenu();
});

const languageButton = document.querySelector(".language-toggle");
const textSkipSelector = "script, style, noscript, .language-toggle";
const translatableAttributes = ["placeholder", "aria-label", "alt", "title", "content"];

function translateTextNodes(root, language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest(textSkipSelector)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    if (!textMemory.has(node)) textMemory.set(node, node.nodeValue);
    const original = textMemory.get(node);
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const key = original.trim();
    node.nodeValue = language === "en" ? `${leading}${englishText[key] || key}${trailing}` : original;
  });
}

function translateAttributes(language) {
  document.querySelectorAll("[placeholder], [aria-label], [alt], [title], meta[name='description']").forEach((element) => {
    translatableAttributes.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;

      let stored = attrMemory.get(element);
      if (!stored) {
        stored = {};
        attrMemory.set(element, stored);
      }
      if (!stored[attribute]) stored[attribute] = element.getAttribute(attribute);

      const original = stored[attribute];
      element.setAttribute(attribute, language === "en" ? englishText[original] || original : original);
    });
  });
}

function updateLanguageButton(language) {
  if (!languageButton) return;
  languageButton.classList.toggle("is-english", language === "en");
  languageButton.setAttribute("aria-pressed", language === "en" ? "true" : "false");
  languageButton.setAttribute("title", language === "en" ? "Switch to Vietnamese" : "Chuyển sang tiếng Anh");
}

function updateLanguageDecorations(language) {
  const limitText = language === "en"
    ? englishText["*Giới hạn 01 sản phẩm / 1 khách hàng trong chương trình"]
    : "*Giới hạn 01 sản phẩm / 1 khách hàng trong chương trình";

  document.querySelectorAll(".product-row").forEach((row) => {
    row.dataset.limitText = limitText;
  });
}

function applyLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("pv-language", language);
  document.documentElement.lang = language;
  document.title = language === "en" ? englishText["PhongVu.vn | Laptop, PC, Màn hình"] : "PhongVu.vn | Laptop, PC, Màn hình";

  translateTextNodes(document.body, language);
  translateAttributes(language);
  updateLanguageButton(language);
  updateLanguageDecorations(language);
  renderFlashSaleProducts(activeFlashSaleKey);
  if (catalogState.products.length) {
    renderCatalogProducts();
  } else {
    renderContextChips();
  }

  const activeMenu = categoryLinks.find((link) => link.classList.contains("is-active"));
  if (activeMenu) renderMegaMenu(activeMenu.dataset.menu);
}

languageButton?.addEventListener("click", () => {
  applyLanguage(currentLanguage === "vi" ? "en" : "vi");
});

setupFlashSaleTabs();
applyLanguage(currentLanguage);
