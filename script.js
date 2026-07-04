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
    ["Nhu cầu", "Laptop Gaming", "Laptop AI", "Laptop đồ họa", "Laptop Sinh viên", "Laptop Văn Phòng", "Laptop cảm ứng 2 in 1", "Laptop mỏng nhẹ", "Laptop Doanh nhân"],
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
  "Tìm kiếm sản phẩm": "Search products",
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
  "Máy In & Mực": "Printers & Ink",
  "Camera-Phụ Kiện": "Cameras - Accessories",
  "Coupon Đến 1TR": "Coupons up to 1M",
  "Giảm Đến 56%": "Up to 56% off",
  "Giảm Tới 21%": "Up to 21% off",
  "Giảm Đến 32%": "Up to 32% off",
  "Giảm Sốc Đến 55%": "Up to 55% off",
  "*Giới hạn 01 sản phẩm / 1 khách hàng trong chương trình": "*Limit 01 product / 1 customer during this program",
  "Kết thúc sau 2 ngày": "Ends in 2 days",
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
  "Lên đầu trang": "Back to top",
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

document.querySelector(".search-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = event.currentTarget.querySelector("input").value.trim();
  if (value) {
    alert(`${tr("Tìm kiếm")}: ${value}`);
  }
});

document.querySelector(".back-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const assistantToggle = document.querySelector(".assistant-toggle");
const assistantPanel = document.querySelector("#assistantChatPanel");
const assistantClose = document.querySelector(".assistant-close");
const assistantForm = document.querySelector(".assistant-chat-form");
const assistantInput = assistantForm?.querySelector("input");
const assistantBody = document.querySelector(".assistant-chat-body");
const contactFloat = document.querySelector(".contact-float");
let assistantSessionId = localStorage.getItem("pv-assistant-session-id");
let assistantIsSending = false;

function setAssistantOpen(isOpen) {
  if (!assistantPanel || !assistantToggle) return;

  assistantPanel.classList.toggle("is-open", isOpen);
  assistantPanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  assistantToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

  if (isOpen) {
    window.setTimeout(() => assistantInput?.focus(), 120);
  }
}

function addChatMessage(text, type = "bot") {
  if (!assistantBody) return;

  const message = document.createElement("p");
  message.className = `chat-message ${type}`;
  message.textContent = text;
  assistantBody.append(message);
  assistantBody.scrollTop = assistantBody.scrollHeight;
  return message;
}

async function sendAssistantPrompt(text) {
  const value = text.trim();
  if (!value || assistantIsSending) return;

  assistantIsSending = true;
  if (assistantInput) assistantInput.disabled = true;
  addChatMessage(value, "user");
  const pendingMessage = addChatMessage("Đang trả lời...", "bot");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: value,
        sessionId: assistantSessionId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === "OPENAI_QUOTA_EXCEEDED") {
        throw new Error("OPENAI_QUOTA_EXCEEDED");
      }
      if (data.error === "OPENAI_RATE_LIMITED") {
        throw new Error("OPENAI_RATE_LIMITED");
      }
      if (data.error === "OPENAI_NOT_CONFIGURED" || data.error === "SUPABASE_NOT_CONFIGURED") {
        throw new Error("CHAT_NOT_CONFIGURED");
      }
      throw new Error(data.error || data.detail || "Chat API failed");
    }

    if (data.sessionId) {
      assistantSessionId = data.sessionId;
      localStorage.setItem("pv-assistant-session-id", assistantSessionId);
    }

    if (pendingMessage) {
      pendingMessage.textContent = data.reply || "Mình chưa có câu trả lời phù hợp. Bạn thử hỏi lại giúp mình nhé.";
    }
  } catch (error) {
    if (pendingMessage) {
      if (error.message === "OPENAI_QUOTA_EXCEEDED") {
        pendingMessage.textContent = "Tài khoản OpenAI API đang hết quota hoặc chưa bật billing. Bạn kiểm tra Usage, Limits và Billing trong OpenAI Platform nhé.";
      } else if (error.message === "OPENAI_RATE_LIMITED") {
        pendingMessage.textContent = "OpenAI đang giới hạn tốc độ gửi yêu cầu. Bạn thử lại sau ít phút nhé.";
      } else if (error.message === "CHAT_NOT_CONFIGURED") {
        pendingMessage.textContent = "Trợ lý AI đang được cấu hình. Website vẫn hoạt động, bạn quay lại chat sau nhé.";
      } else {
        pendingMessage.textContent = "Hiện tại trợ lý chưa kết nối được. Bạn kiểm tra lại key và terminal giúp mình nhé.";
      }
    }
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
  setAssistantOpen(!assistantPanel?.classList.contains("is-open"));
});

assistantClose?.addEventListener("click", () => setAssistantOpen(false));

assistantForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = assistantInput?.value.trim() || "";
  sendAssistantPrompt(value);
  if (assistantInput) assistantInput.value = "";
});

document.querySelectorAll(".chat-suggestions button").forEach((button) => {
  button.addEventListener("click", () => sendAssistantPrompt(button.textContent || ""));
});

document.addEventListener("click", (event) => {
  if (!assistantPanel?.classList.contains("is-open")) return;
  if (contactFloat?.contains(event.target)) return;
  setAssistantOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setAssistantOpen(false);
});

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
  link.addEventListener("click", (event) => event.preventDefault());
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

  const activeMenu = categoryLinks.find((link) => link.classList.contains("is-active"));
  if (activeMenu) renderMegaMenu(activeMenu.dataset.menu);
}

languageButton?.addEventListener("click", () => {
  applyLanguage(currentLanguage === "vi" ? "en" : "vi");
});

applyLanguage(currentLanguage);
