# Seven Travel - Huong dan dang bai bang ZIP (khong can Terminal)

## A. Cai ban nang cap mot lan
1. Tai file `SevenTravel_GitHub_Article_Publisher_Update.zip` va giai nen tren Mac.
2. Mo **GitHub Desktop** -> repository `seven-travel-vietnam-guide` -> **Show in Finder**.
3. Copy **cac thu muc ben trong** file ZIP (assets, scripts, studio, content, docs...) vao thu muc repository, cho phep **Replace/Merge** cac file trung ten. **Khong xoa `.git`** va khong xoa cac file khac.
4. GitHub Desktop -> Changes -> xem danh sach file -> nhap Summary: `Add Article Package Publisher` -> **Commit to main** -> **Push origin**.
5. Mo Vercel -> project `seven-travel-vietnam-guide` -> Deployments -> kiem tra **Ready**. Project `...-studio` co the duoc build lai vi schema co them `Seven Travel Tip`.
6. Truy cap website blog: bai Sanity hien tai van phai duoc giu nguyen, khong tao bai mau moi.

## B. Dang mot bai moi sau nay
1. Nho ChatGPT tao mot `Article Package ZIP`: viet noi dung, chon anh co quyen su dung, soan `article.json`, `article.html`, `images/`, bao gom SEO, alt text, TOC, FAQ va CTA.
2. Mac dinh `status` la **draft**. Can xac nhan noi dung, nguon, gia tri phap ly, ngay cap nhat va ban quyen anh truoc khi doi sang **published**.
3. Giai nen goi ZIP; copy thu muc `<slug>` vao `content/article-packs/` trong repository GitHub Desktop.
4. Doi `"status": "draft"` -> `"status": "published"` bang TextEdit/VS Code, dam bao ghi file van ban plain text.
5. Trong GitHub Desktop: Commit to main -> Push origin.
6. Vercel tu deploy website moi. Mo `/vietnam-travel-tips/guides/<slug>/` de kiem tra.

## C. Co the dung song song voi Sanity
- Bai Sanity da Publish van duoc tai va giu nguyen.
- Bai ZIP moi hien ben canh bai Sanity tren homepage, category, search, sitemap.
- Neu slug trung Sanity, bai Sanity duoc uu tien; trong Vercel log se ghi canh bao. Chi dat `replaceSanity: true` khi co chu dich.
- Neu can sua mot bai dang bang ZIP, chinh sua article.html/article.json trong GitHub roi commit/push. Sanity dashboard khong tu dong quan ly noi dung cua bai ZIP.

## D. SEO va launch
- Dung image JPEG/WebP goc thuc te co license (VD Pexels, Unsplash), khong nhung hinh tu website khac ma khong duoc phep.
- Website da dat canonical theo `www.seventravel.vn/vietnam-travel-tips`; chi bat index `SITE_LIVE=true` sau khi da gan rewrite/domain va kiem tra tat ca URL, noi dung.
- Muon nhan moi lan Publish Sanity tu update, can tao Vercel Deploy Hook + Sanity Webhook; chua nam trong ban nang cap nay.

## E. Neu gap loi
- Vercel Deployments -> chon deployment Error -> Build Logs -> chup 20 dong cuoi gui ChatGPT.
- Loi `Missing image` -> file `images/...` trong HTML hoac article.json khong ton tai.
- Loi `Unsupported <...>` -> HTML chua script, iframe, CSS inline hoac tag khong duoc ho tro. Yeu cau ChatGPT tao lai article.html theo quy tac trong content/article-packs/README.md.
