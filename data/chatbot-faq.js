const faqItems = [
  {
    title: "Tư vấn laptop học tập",
    keywords: ["tu van laptop", "laptop hoc tap", "sinh vien", "hoc lap trinh", "hoc online"],
    answer:
      "Nếu bạn cần laptop học tập, mình gợi ý ưu tiên Core i5/Ryzen 5 trở lên, RAM 16GB, SSD 512GB và màn hình 14-15.6 inch. Bạn cho mình biết ngân sách và ngành học để mình tư vấn sát hơn nhé.",
  },
  {
    title: "Tư vấn laptop văn phòng",
    keywords: ["laptop van phong", "may van phong", "word excel", "ke toan"],
    answer:
      "Với nhu cầu văn phòng, bạn nên chọn máy mỏng nhẹ, RAM 16GB, SSD 512GB, pin tốt và bàn phím dễ gõ. Nếu dùng Excel nặng hoặc kế toán, nên ưu tiên CPU Core i5/Ryzen 5 trở lên.",
  },
  {
    title: "Tư vấn laptop gaming",
    keywords: ["laptop gaming", "choi game", "rtx", "gaming"],
    answer:
      "Laptop gaming nên ưu tiên GPU rời RTX, RAM tối thiểu 16GB, SSD 512GB và màn hình từ 144Hz nếu bạn chơi game FPS. Bạn cho mình biết tựa game và ngân sách để mình lọc cấu hình phù hợp.",
  },
  {
    title: "Tư vấn build PC",
    keywords: ["build pc", "lap pc", "pc gaming", "may tinh ban", "cau hinh pc"],
    answer:
      "Để build PC hợp lý, mình cần biết ngân sách, màn hình đang dùng, nhu cầu chính là game, đồ họa hay văn phòng. Nguyên tắc chung là cân CPU, VGA, RAM và nguồn để tránh nghẽn hiệu năng.",
  },
  {
    title: "Màn hình",
    keywords: ["man hinh", "monitor", "24 inch", "27 inch", "144hz", "2k"],
    answer:
      "Nếu dùng văn phòng, màn 24 inch Full HD là đủ. Nếu chơi game hoặc thiết kế, bạn có thể chọn 27 inch 2K, tần số quét 144Hz trở lên và tấm nền IPS để màu sắc tốt hơn.",
  },
  {
    title: "Khuyến mãi",
    keywords: ["khuyen mai", "giam gia", "uu dai", "voucher", "flash sale"],
    answer:
      "Các chương trình khuyến mãi có thể thay đổi theo thời điểm. Bạn có thể xem mục Ưu đãi hot hoặc gửi tên sản phẩm/ngân sách, mình sẽ gợi ý nhóm sản phẩm đáng chú ý.",
  },
  {
    title: "Trả góp",
    keywords: ["tra gop", "gop 0", "0%", "the tin dung"],
    answer:
      "Nhiều sản phẩm có thể hỗ trợ trả góp tùy chương trình và đối tác thanh toán. Bạn nên chuẩn bị CCCD, số điện thoại và thông tin thẻ/tài chính nếu cần. Mình có thể tư vấn sản phẩm phù hợp trước.",
  },
  {
    title: "Giao hàng",
    keywords: ["giao hang", "ship", "van chuyen", "bao lau nhan hang"],
    answer:
      "Thời gian giao hàng phụ thuộc khu vực và tình trạng hàng. Bạn cho mình biết tỉnh/thành và sản phẩm cần mua, mình sẽ hướng dẫn cách kiểm tra hoặc liên hệ hỗ trợ.",
  },
  {
    title: "Bảo hành",
    keywords: ["bao hanh", "doi tra", "loi san pham", "bao tri"],
    answer:
      "Chính sách bảo hành phụ thuộc từng sản phẩm và hãng. Bạn giữ hóa đơn/phiếu mua hàng và gửi model hoặc mã đơn, nhân viên hỗ trợ sẽ kiểm tra điều kiện bảo hành cụ thể.",
  },
  {
    title: "Liên hệ hotline",
    keywords: ["hotline", "so dien thoai", "lien he", "tu van truc tiep"],
    answer:
      "Bạn có thể liên hệ hotline 1800 6867 để được hỗ trợ trực tiếp. Nếu muốn, bạn cũng có thể nhắn nhu cầu tại đây, mình sẽ gợi ý trước.",
  },
  {
    title: "Đơn hàng",
    keywords: ["don hang", "kiem tra don", "ma don", "tinh trang don"],
    answer:
      "Để kiểm tra đơn hàng, bạn cần mã đơn hoặc số điện thoại đặt hàng. Vì lý do bảo mật, mình không hiển thị thông tin cá nhân tại chat này; bạn nên liên hệ hotline hoặc trang kiểm tra đơn hàng.",
  },
  {
    title: "Xuất hóa đơn",
    keywords: ["hoa don", "vat", "xuat hoa don", "cong ty"],
    answer:
      "Nếu cần xuất hóa đơn VAT, bạn nên chuẩn bị tên công ty, mã số thuế, địa chỉ và email nhận hóa đơn. Hãy cung cấp thông tin này khi đặt hàng hoặc liên hệ hỗ trợ sau khi mua.",
  },
];

function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s%]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findFaqAnswer(message) {
  const normalizedMessage = normalizeText(message);
  if (!normalizedMessage) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const item of faqItems) {
    const score = item.keywords.reduce((total, keyword) => {
      return normalizedMessage.includes(normalizeText(keyword)) ? total + 1 : total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestScore > 0 ? bestMatch.answer : null;
}

export { faqItems };
