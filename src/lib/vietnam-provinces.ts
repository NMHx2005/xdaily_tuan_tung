export interface Ward {
  name: string;
}

export interface District {
  name: string;
  wards: Ward[];
}

export interface Province {
  name: string;
  districts: District[];
}

export const PROVINCES: Province[] = [
  {
    name: "TP. Hồ Chí Minh",
    districts: [
      { name: "Quận 1", wards: [{ name: "Phường Bến Nghé" }, { name: "Phường Bến Thành" }, { name: "Phường Cầu Kho" }, { name: "Phường Đa Kao" }, { name: "Phường Nguyễn Cư Trinh" }] },
      { name: "Quận 3", wards: [{ name: "Phường 1" }, { name: "Phường 2" }, { name: "Phường 3" }, { name: "Phường 4" }, { name: "Phường 5" }] },
      { name: "Quận 7", wards: [{ name: "Phường Tân Phong" }, { name: "Phường Tân Phú" }, { name: "Phường Tân Thuận Đông" }, { name: "Phường Phú Mỹ" }] },
      { name: "Quận Bình Thạnh", wards: [{ name: "Phường 1" }, { name: "Phường 2" }, { name: "Phường 3" }, { name: "Phường 5" }, { name: "Phường 7" }] },
      { name: "Quận Gò Vấp", wards: [{ name: "Phường 1" }, { name: "Phường 3" }, { name: "Phường 5" }, { name: "Phường 7" }, { name: "Phường 10" }] },
      { name: "TP. Thủ Đức", wards: [{ name: "Phường Hiệp Bình Chánh" }, { name: "Phường Hiệp Bình Phước" }, { name: "Phường Linh Đông" }, { name: "Phường Linh Trung" }] },
    ],
  },
  {
    name: "Hà Nội",
    districts: [
      { name: "Quận Ba Đình", wards: [{ name: "Phường Cống Vị" }, { name: "Phường Điện Biên" }, { name: "Phường Đội Cấn" }, { name: "Phường Kim Mã" }] },
      { name: "Quận Hoàn Kiếm", wards: [{ name: "Phường Chương Dương" }, { name: "Phường Cửa Đông" }, { name: "Phường Hàng Bạc" }, { name: "Phường Hàng Bồ" }] },
      { name: "Quận Đống Đa", wards: [{ name: "Phường Cát Linh" }, { name: "Phường Hàng Bột" }, { name: "Phường Khâm Thiên" }, { name: "Phường Láng Hạ" }] },
      { name: "Quận Cầu Giấy", wards: [{ name: "Phường Dịch Vọng" }, { name: "Phường Mai Dịch" }, { name: "Phường Nghĩa Đô" }, { name: "Phường Quan Hoa" }] },
      { name: "Quận Thanh Xuân", wards: [{ name: "Phường Khương Đình" }, { name: "Phường Khương Mai" }, { name: "Phường Nhân Chính" }, { name: "Phường Thanh Xuân Bắc" }] },
    ],
  },
  {
    name: "Đà Nẵng",
    districts: [
      { name: "Quận Hải Châu", wards: [{ name: "Phường Hải Châu 1" }, { name: "Phường Hải Châu 2" }, { name: "Phường Thanh Bình" }, { name: "Phường Thuận Phước" }] },
      { name: "Quận Thanh Khê", wards: [{ name: "Phường An Khê" }, { name: "Phường Chính Gián" }, { name: "Phường Tam Thuận" }, { name: "Phường Thanh Khê Đông" }] },
      { name: "Quận Sơn Trà", wards: [{ name: "Phường An Hải Bắc" }, { name: "Phường An Hải Đông" }, { name: "Phường Mân Thái" }, { name: "Phường Nại Hiên Đông" }] },
    ],
  },
  {
    name: "Bình Dương",
    districts: [
      { name: "TP. Thủ Dầu Một", wards: [{ name: "Phường Chánh Nghĩa" }, { name: "Phường Hiệp Thành" }, { name: "Phường Phú Cường" }, { name: "Phường Phú Hòa" }] },
      { name: "TP. Dĩ An", wards: [{ name: "Phường An Bình" }, { name: "Phường Bình An" }, { name: "Phường Dĩ An" }, { name: "Phường Đông Hòa" }] },
      { name: "TP. Thuận An", wards: [{ name: "Phường An Phú" }, { name: "Phường Bình Chuẩn" }, { name: "Phường Bình Hòa" }, { name: "Phường Lái Thiêu" }] },
    ],
  },
  {
    name: "Đồng Nai",
    districts: [
      { name: "TP. Biên Hòa", wards: [{ name: "Phường An Bình" }, { name: "Phường Bửu Hòa" }, { name: "Phường Hố Nai" }, { name: "Phường Long Bình" }] },
      { name: "TP. Long Khánh", wards: [{ name: "Phường Xuân An" }, { name: "Phường Xuân Bình" }, { name: "Phường Xuân Hòa" }, { name: "Phường Xuân Thanh" }] },
    ],
  },
];
