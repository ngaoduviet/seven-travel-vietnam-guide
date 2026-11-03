# HƯỚNG DẪN ĐĂNG BÀI SEVEN TRAVEL – 2027

**Trạng thái:** Gói hoàn chỉnh đã có ảnh du lịch thật, được tối ưu WebP, và đã kiểm tra theo Publisher v1.0. Người dùng cần duyệt nội dung và ảnh trên Vercel Preview trước khi Merge Production.

## Thông tin bài

- Title: **Best Time to Visit Vietnam in 2027: Month-by-Month Guide**
- Slug: `best-time-to-visit-vietnam-2027`
- URL dự kiến trên domain Preview: `/vietnam-travel-tips/guides/best-time-to-visit-vietnam-2027/`
- Category: `travel-essentials`
- Trạng thái trong JSON: `published` (để hiện trên Vercel Preview sau khi Push); `replaceSanity=false`.
- Dung lượng bài: khoảng 1,945 từ tiếng Anh, đọc 9 phút.
- Nguồn kiểm chứng ngày: **3 November 2026**.

## Đăng bài KHÔNG chỉnh code

1. Tải ZIP này, giải nén trên Mac thành 1 thư mục `best-time-to-visit-vietnam-2027`.
2. GitHub Desktop → repository `seven-travel-vietnam-guide` → chọn branch Preview (nhánh `feature/article-package-publisher` hoặc branch Preview đang dùng).
3. Repository → Show in Finder → đi tới `content/article-packs/`.
4. Copy **cả thư mục `best-time-to-visit-vietnam-2027`** vào `content/article-packs/`. Đừng copy từng file và đừng đặt nguyên ZIP vào repository.
5. Trở lại GitHub Desktop, bỏ tick `.DS_Store` nếu có; nhập Summary: `Add SEO guide: best time to visit Vietnam 2027`, nhấn Commit, rồi Push origin.
6. Vercel → Deployments → mở bản Preview tương ứng → đảm bảo trạng thái Ready. Mở bài ở URL `/vietnam-travel-tips/guides/best-time-to-visit-vietnam-2027/` thuộc domain Preview đó.
7. Kiểm tra cover, 4 ảnh trong bài, mục lục, FAQ, Seven Travel Tip, CTA, các link nguồn và hiển thị mobile. Chỉ Merge `main` khi bạn đã duyệt.

## Nguồn dữ kiện chính

- Cục Du lịch Quốc gia Việt Nam – thời tiết và các mùa theo vùng: https://vietnam.travel/things-to-do/weather-and-climate-vietnam/
- Cổng Thông tin Chính phủ – lịch nghỉ Tết 2027 (4–10 February 2027): https://xaydungchinhsach.chinhphu.vn/de-xuat-2-phuong-an-nghi-tet-nguyen-dan-2027-tet-dinh-mui-11926080513033257.htm
- Ngày mùng một Tết 2027: Saturday, 6 February 2027, đối chiếu https://www.timeanddate.com/holidays/vietnam/tet-new-year

Lưu ý: Đây là các mô hình khí hậu trung bình, không phải dự báo thời tiết cho 2027. Không cam kết tháng nào hoàn toàn không mưa. Trong mùa mưa bão, tra cảnh báo thời tiết và kiểm tra lịch tàu/bay thực tế.

## Ảnh và bản quyền

Toàn bộ **5 ảnh WebP thật** được đóng gói trực tiếp trong `images/`, không phụ thuộc kết nối mạng khi Deploy. Chi tiết ảnh, tên tác giả, liên kết giấy phép và chỉnh sửa ở `IMAGE-CREDITS.md`.

Nếu đổi ảnh: thay bằng file WebP cùng tên (`cover.webp`, `photo-1.webp` đến `photo-4.webp`) và giữ nguyên đường dẫn. Tự rà soát mô tả alt, caption và credit nếu đổi sang ảnh khác.

**SEO triển khai:** Phần mềm Vercel Preview có thể giữ `noindex` và banner Editorial Preview. Gói ZIP không tự bật indexing hoặc đặt custom domain. Đây là công việc cấu hình site riêng.
