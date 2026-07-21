import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { type RootState, useAppDispatch } from "../../redux/store";
import { setLanguage } from "../../redux/languageSlice";
import { ArrowTurnBackwardIcon } from "hugeicons-react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  id: string;
  category: string;
  items: FaqItem[];
}

const getFaqData = (lang: string): FaqSection[] => {
  const vi = lang === "vi";
  return [
    {
      id: "overview",
      category: vi ? "Tổng quan hệ thống" : "System Overview",
      items: [
        {
          q: vi
            ? "Web admin này dùng để làm gì?"
            : "What is this admin panel for?",
          a: vi
            ? "Web admin là hệ thống quản lý buổi đánh cầu lông vãng lai. Admin có thể tạo buổi đánh (session), quản lý danh sách người tham gia, tính phí vãng lai cho từng người và xuất kết quả để chia sẻ với người chơi. Người dùng có thể tự đăng ký qua trang chính (/) và xem phí qua trang /money."
            : "The admin panel is a badminton drop-in session management system. Admins can create sessions, manage participant lists, calculate drop-in fees per person, and publish results for players to view. Users can self-register on the main page (/) and view fees at /money.",
        },
        {
          q: vi
            ? "Ai có thể sử dụng trang admin?"
            : "Who can access the admin panel?",
          a: vi
            ? "Chỉ những người có tài khoản admin mới có thể truy cập trang quản lý. Trang admin được bảo vệ bằng xác thực JWT token. Người dùng thông thường chỉ có thể truy cập trang chính (/) để đăng ký và trang phí vãng lai (/money) để xem kết quả."
            : "Only users with an admin account can access the management panel. The admin panel is protected with JWT token authentication. Regular users can only access the main page (/) to register and the fees page (/money) to view results.",
        },
        {
          q: vi
            ? "Hệ thống hỗ trợ những ngôn ngữ nào?"
            : "What languages does the system support?",
          a: vi
            ? "Hệ thống hỗ trợ hai ngôn ngữ: Tiếng Việt (VI) và Tiếng Anh (EN). Bạn có thể chuyển đổi ngôn ngữ bằng cách nhấn nút 'VI' hoặc 'EN' ở góc trên bên phải của trang admin."
            : "The system supports two languages: Vietnamese (VI) and English (EN). Switch languages by clicking the 'VI' or 'EN' button in the top-right corner of the admin page.",
        },
        {
          q: vi
            ? "Luồng hoạt động tổng quát của hệ thống là gì?"
            : "What is the overall workflow of the system?",
          a: vi
            ? "1. Admin tạo buổi đánh và chọn nó làm buổi hiện tại\n2. Người dùng vào trang chính (/), thấy lời mời và đăng ký tham gia\n3. Admin kiểm tra danh sách, thêm/xóa người nếu cần\n4. Admin nhập thông tin chi phí và nhấn 'Tính tiền'\n5. Admin tải mã QR lên (nếu có) và nhấn 'Show kết quả'\n6. Người dùng vào /money để xem số tiền phải trả và quét mã QR để thanh toán\n7. Admin đánh dấu những người đã thanh toán trong bảng quản lý"
            : "1. Admin creates a session and selects it as the current active session\n2. Users visit the main page (/), see the invitation, and register\n3. Admin reviews the list, adds/removes participants as needed\n4. Admin enters cost information and clicks 'Calculate'\n5. Admin uploads a QR code (optional) and clicks 'Show result'\n6. Users visit /money to see their fee and scan the QR to pay\n7. Admin marks paid participants in the management table",
        },
      ],
    },
    {
      id: "login",
      category: vi ? "Đăng nhập & Bảo mật" : "Login & Security",
      items: [
        {
          q: vi
            ? "Tôi đăng nhập vào trang admin như thế nào?"
            : "How do I log in to the admin panel?",
          a: vi
            ? "Truy cập đường dẫn /login-to-ql-page-110, nhập tên đăng nhập và mật khẩu, sau đó nhấn nút 'Đăng nhập'. Nếu thông tin chính xác, bạn sẽ được chuyển hướng tự động đến trang quản lý."
            : "Navigate to /login-to-ql-page-110, enter your username and password, then click 'Login'. If credentials are correct, you will be automatically redirected to the admin dashboard.",
        },
        {
          q: vi
            ? "Phiên đăng nhập hết hạn khi nào và phải xử lý như thế nào?"
            : "When does my session expire and what should I do?",
          a: vi
            ? "Phiên đăng nhập có thời hạn nhất định (dựa trên JWT token). Khi còn ít thời gian, hệ thống hiện hộp thoại cảnh báo 'Phiên đăng nhập sắp hết hạn' với bộ đếm ngược.\n• Nhấn 'Tiếp tục' để gia hạn phiên và tiếp tục làm việc\n• Nhấn 'Đăng nhập lại' nếu phiên đã hết hạn\nNếu không thao tác kịp, bạn sẽ tự động bị đăng xuất và cần đăng nhập lại."
            : "Sessions have a set duration based on the JWT token. When time is running low, a warning dialog 'Session About to Expire' appears with a countdown.\n• Click 'Stay Logged In' to extend the session and continue working\n• Click 'Log In Again' if the session has already expired\nIf you don't act in time, you will be automatically logged out and need to log in again.",
        },
        {
          q: vi ? "Làm thế nào để đăng xuất?" : "How do I log out?",
          a: vi
            ? "Nhấn nút 'Đăng xuất' (màu đỏ) ở góc trên bên phải trang admin. Sau khi đăng xuất, token xác thực sẽ bị xóa và bạn cần đăng nhập lại để tiếp tục quản lý."
            : "Click the 'Logout' button (red) in the top-right corner of the admin page. After logging out, your authentication token is cleared and you need to log in again to continue managing.",
        },
        {
          q: vi
            ? "Tôi quên mật khẩu admin phải làm thế nào?"
            : "What do I do if I forget my admin password?",
          a: vi
            ? "Liên hệ trực tiếp với quản trị viên hệ thống (người cài đặt backend) để reset mật khẩu. Hiện tại hệ thống chưa có tính năng tự đặt lại mật khẩu qua email."
            : "Contact the system administrator (the person who set up the backend) to reset the password. The system currently does not have a self-service password reset feature via email.",
        },
      ],
    },
    {
      id: "sessions",
      category: vi ? "Quản lý Buổi Đánh" : "Session Management",
      items: [
        {
          q: vi
            ? "Làm thế nào để tạo buổi đánh mới?"
            : "How do I create a new session?",
          a: vi
            ? "Nhấn nút 'Tạo Ngày Mới' (màu xanh lá) ở góc trên bên phải danh sách buổi đánh. Trong modal tạo buổi:\n• Tên buổi đánh: VD 'Ngày 27/6, 19h30' (bắt buộc)\n• Nội dung tuyển người: VD 'Tuyển vãng lai, 8 nam (TB, TB+), 6 nữ (TB-, TB)' (tùy chọn)\n• Số lượng slot nam/nữ: để giới hạn số người đăng ký theo giới tính (tùy chọn)\nNhấn 'Thêm' để tạo. Buổi mới sẽ xuất hiện trong danh sách."
            : "Click the 'Create New Date' button (green) in the top-right of the session list. In the creation modal:\n• Session name: e.g. 'Jun 27, 7:30pm' (required)\n• Recruitment content: e.g. 'Looking for players, 8 males (TB, TB+), 6 females (TB-, TB)' (optional)\n• Male/female slot counts: to limit registrations by gender (optional)\nClick 'Add' to create. The new session appears in the list.",
        },
        {
          q: vi
            ? "Làm thế nào để chỉnh sửa thông tin buổi đánh?"
            : "How do I edit a session?",
          a: vi
            ? "Nhấn nút màu vàng (biểu tượng bút chì) bên cạnh buổi đánh cần sửa. Trong modal sửa bạn có thể:\n• Sửa tên buổi đánh\n• Sửa nội dung tuyển người\n• Tích hoặc bỏ tích 'Chọn Ngày' để đặt buổi này làm buổi hiện tại\nNhấn 'Lưu' để áp dụng thay đổi."
            : "Click the yellow button (pencil icon) next to the session to edit. In the edit modal you can:\n• Edit the session name\n• Edit the recruitment content\n• Check or uncheck 'Select Date' to make this the active session\nClick 'Save' to apply changes.",
        },
        {
          q: vi
            ? "Làm thế nào để đặt buổi đánh hiện tại cho người dùng đăng ký?"
            : "How do I set the current active session for user registration?",
          a: vi
            ? "Mở modal sửa buổi đánh (nhấn nút vàng), tích vào ô 'Chọn Ngày (Chọn ngày này để bỏ phiếu)'. Nhấn 'Lưu'.\n\nBuổi được chọn sẽ:\n• Hiển thị nhãn màu xanh lá 'Ngày được chọn' trong danh sách admin\n• Xuất hiện trên trang chính (/) để người dùng đăng ký\n\nChỉ một buổi có thể được chọn tại một thời điểm. Khi chọn buổi mới, buổi cũ sẽ tự động bị bỏ chọn."
            : "Open the edit modal (yellow button), check 'Select Date (Choose this date to vote)'. Click 'Save'.\n\nThe selected session will:\n• Show a green 'Selected date' label in the admin list\n• Appear on the main page (/) for user registration\n\nOnly one session can be active at a time. Selecting a new session automatically deselects the previous one.",
        },
        {
          q: vi
            ? "Làm thế nào để xóa buổi đánh?"
            : "How do I delete a session?",
          a: vi
            ? "Nhấn nút màu đỏ (biểu tượng thùng rác) bên cạnh buổi đánh cần xóa. Hộp thoại xác nhận sẽ xuất hiện. Nhấn 'Xóa' để xác nhận.\n\nLưu ý quan trọng: Xóa buổi đánh sẽ xóa vĩnh viễn toàn bộ người tham gia và kết quả tính tiền của buổi đó. Thao tác này không thể hoàn tác."
            : "Click the red button (trash icon) next to the session to delete. A confirmation dialog will appear. Click 'Delete' to confirm.\n\nImportant: Deleting a session permanently removes all participants and calculated results for that session. This action cannot be undone.",
        },
        {
          q: vi
            ? "Ý nghĩa của 'Nam: X/Y · Nữ: X/Y' là gì?"
            : "What does 'Male: X/Y · Female: X/Y' mean?",
          a: vi
            ? "Đây là số lượng người đã đăng ký so với tổng slot cho mỗi giới tính.\n• VD 'Nam: 3/8': đã có 3 nam đăng ký trên tổng 8 slot dành cho nam\n• VD 'Nữ: 6/6': slot nữ đã đầy\n\nKhi slot đầy, trang đăng ký của người dùng sẽ hiển thị '(hết)' và không cho phép đăng ký thêm cho giới tính đó. Nếu admin không cài đặt số lượng slot, sẽ không có giới hạn."
            : "This shows registrations versus total slots per gender.\n• E.g. 'Male: 3/8': 3 males registered out of 8 total male slots\n• E.g. 'Female: 6/6': female slots are full\n\nWhen full, the user registration page shows '(full)' and prevents further registration for that gender. If the admin didn't set slot counts, there is no limit.",
        },
      ],
    },
    {
      id: "participants",
      category: vi ? "Quản lý Người Tham Gia" : "Participant Management",
      items: [
        {
          q: vi
            ? "Làm thế nào để xem danh sách người tham gia?"
            : "How do I view the participant list?",
          a: vi
            ? "Nhấn vào mũi tên (►) bên trái tên buổi đánh để mở rộng và xem chi tiết. Bảng người tham gia hiển thị:\n• STT (số thứ tự)\n• Tên người tham gia\n• Giới tính\n• Số tiền (sau khi tính)\n• Trạng thái thanh toán (checkbox)\n• Nút xóa"
            : "Click the arrow (►) to the left of the session name to expand and view details. The participant table shows:\n• No. (sequence number)\n• Participant name\n• Gender\n• Amount (after calculation)\n• Payment status (checkbox)\n• Delete button",
        },
        {
          q: vi
            ? "Làm thế nào để thêm người tham gia thủ công?"
            : "How do I manually add a participant?",
          a: vi
            ? "Nhấn nút màu xanh lá (biểu tượng thêm người) bên cạnh buổi đánh. Trong hộp thoại 'Thêm thành viên':\n• Nhập tên người tham gia (bắt buộc)\n• Chọn giới tính: Nam hoặc Nữ (bắt buộc)\n• Nhập trình độ nếu cần (tùy chọn, VD: TB, TB+, TB-)\nNhấn 'Thêm' để xác nhận. Người tham gia sẽ xuất hiện ngay trong bảng."
            : "Click the green button (add person icon) next to the session. In the 'Add Participant' dialog:\n• Enter the participant's name (required)\n• Select gender: Male or Female (required)\n• Enter skill level if needed (optional, e.g. TB, TB+, TB-)\nClick 'Add' to confirm. The participant will appear in the table immediately.",
        },
        {
          q: vi
            ? "Làm thế nào để xóa người tham gia?"
            : "How do I remove a participant?",
          a: vi
            ? "Mở rộng buổi đánh (nhấn mũi tên ►), tìm người cần xóa trong bảng danh sách, nhấn nút màu đỏ (biểu tượng thùng rác) ở cột cuối cùng. Xác nhận xóa trong hộp thoại hiện ra."
            : "Expand the session (click ►), find the person in the participant table, click the red button (trash icon) in the last column. Confirm the deletion in the dialog that appears.",
        },
        {
          q: vi
            ? "Làm thế nào để đánh dấu người đã thanh toán?"
            : "How do I mark a participant as paid?",
          a: vi
            ? "Mở rộng buổi đánh, trong bảng người tham gia, nhấn vào ô checkbox ở cột 'Thanh toán' của người đó.\n• Checkbox được tích (✓): đã thanh toán\n• Checkbox trống: chưa thanh toán\n\nThay đổi được lưu tự động và ngay lập tức cập nhật trên trang /money."
            : "Expand the session, in the participant table, click the checkbox in the 'Paid' column for that person.\n• Checked (✓): paid\n• Unchecked: not paid\n\nChanges are saved automatically and immediately update on the /money page.",
        },
        {
          q: vi
            ? "Người dùng tự đăng ký như thế nào? Admin cần làm gì sau đó?"
            : "How do users self-register? What does admin do afterward?",
          a: vi
            ? "Người dùng truy cập trang chính (/), nhìn thấy lời mời tham gia buổi đánh đang được chọn, nhấn 'Đi', điền tên và chọn giới tính/trình độ, nhấn 'OK'. Họ sẽ xuất hiện ngay trong danh sách admin.\n\nSau khi đủ người, admin:\n1. Kiểm tra và điều chỉnh danh sách nếu cần (thêm/xóa người)\n2. Nhập thông tin chi phí vào textarea\n3. Nhấn 'Tính tiền' để AI tính phí\n4. Tải QR code lên (nếu có)\n5. Nhấn 'Show kết quả' để xuất bản"
            : "Users visit the main page (/), see the invitation for the active session, click 'Go', fill in their name and select gender/level, click 'OK'. They immediately appear in the admin list.\n\nOnce enough participants have registered, admin:\n1. Reviews and adjusts the list if needed (add/remove people)\n2. Enters cost information in the textarea\n3. Clicks 'Calculate' for AI fee calculation\n4. Uploads a QR code (optional)\n5. Clicks 'Show result' to publish",
        },
      ],
    },
    {
      id: "calculate",
      category: vi ? "Tính tiền & Xuất kết quả" : "Calculate & Export Results",
      items: [
        {
          q: vi
            ? "Làm thế nào để tính tiền phí vãng lai cho buổi đánh?"
            : "How do I calculate drop-in fees for a session?",
          a: vi
            ? "Mở rộng buổi đánh (nhấn ►), trong phần 'Thông tin buổi đánh', nhập thông tin chi phí vào ô textarea.\n\nVí dụ: 'Hôm nay tiền sân là 500.000đ, tiền cầu là 200.000đ (10 trái cầu, 1 trái giá 20.000đ)'\n\nSau đó nhấn nút vàng 'Tính tiền'. Hệ thống AI sẽ phân tích thông tin và tự động tính số tiền mỗi người phải đóng. Kết quả xuất hiện trong cột 'Số tiền' của bảng người tham gia."
            : "Expand the session (click ►), in the 'Session info' field, enter cost information in the textarea.\n\nExample: 'Today court fee is 500,000đ, shuttle fee is 200,000đ (10 shuttles at 20,000đ each)'\n\nThen click the yellow 'Calculate' button. The AI system analyzes the information and automatically calculates the amount each person owes. Results appear in the 'Amount' column of the participant table.",
        },
        {
          q: vi
            ? "Tôi nhập thông tin chi phí theo định dạng nào?"
            : "What format should I use for cost information?",
          a: vi
            ? "Nhập văn bản tự nhiên bằng tiếng Việt hoặc tiếng Anh. Hệ thống AI sẽ tự hiểu.\n\nVí dụ các định dạng hợp lệ:\n• 'Tiền sân 600k, cầu 150k (6 trái, 25k/trái). Chia đều 14 người'\n• 'Court: 500k. Shuttle: 200k (10 quả). Total split among all participants'\n• 'Sân 2 tiếng x 250k = 500k. 8 trái cầu x 22k = 176k'\n\nNếu kết quả tính sai, bạn có thể sửa thông tin và nhấn 'Tính tiền' lại."
            : "Enter natural language text in Vietnamese or English. The AI system will understand.\n\nValid format examples:\n• 'Court 600k, shuttles 150k (6 shuttles, 25k each). Split equally among 14 people'\n• 'Court: 500k. Shuttle: 200k (10 shuttlecocks). Total split among all participants'\n• '2hrs court x 250k = 500k. 8 shuttles x 22k = 176k'\n\nIf the result is incorrect, edit the information and click 'Calculate' again.",
        },
        {
          q: vi
            ? "Làm thế nào để xuất và chia sẻ kết quả với người chơi?"
            : "How do I export and share results with players?",
          a: vi
            ? "Sau khi tính tiền thành công, nhấn nút xanh dương 'Show kết quả'. Kết quả sẽ:\n• Hiển thị trong phần 'Chi tiết' khi mở rộng buổi đánh trong trang admin\n• Xuất hiện trên trang phí vãng lai (/money) để tất cả người chơi xem\n• Kèm theo mã QR (nếu đã tải lên) để người chơi quét và thanh toán"
            : "After a successful calculation, click the blue 'Show result' button. Results will:\n• Appear in the 'Details' section when expanding the session in the admin panel\n• Be published on the fees page (/money) for all players to view\n• Include the QR code (if uploaded) for players to scan and pay",
        },
        {
          q: vi
            ? "Tôi có thể tính tiền lại sau khi đã xuất kết quả không?"
            : "Can I recalculate after already exporting results?",
          a: vi
            ? "Có, bạn có thể tính lại bất kỳ lúc nào. Sửa thông tin chi phí trong textarea và nhấn 'Tính tiền' lại. Sau đó nhấn 'Show kết quả' để cập nhật kết quả mới lên trang /money. Kết quả cũ sẽ bị ghi đè."
            : "Yes, you can recalculate at any time. Edit the cost information in the textarea and click 'Calculate' again. Then click 'Show result' to update the new results on the /money page. The previous results will be overwritten.",
        },
        {
          q: vi
            ? "Phần 'Chi tiết' hiển thị thông tin gì?"
            : "What does the 'Details' section show?",
          a: vi
            ? "Phần 'Chi tiết' (hiển thị khi mở rộng buổi đánh) cho thấy kết quả tính tiền dạng văn bản do AI tổng hợp, bao gồm: tổng chi phí, phân bổ chi phí từng người, và các ghi chú liên quan. Nếu chưa có kết quả, nó hiển thị 'Chưa có thông tin chi tiết'."
            : "The 'Details' section (visible when expanding the session) shows the AI-generated text result of the calculation, including: total costs, per-person cost breakdown, and relevant notes. If no results yet, it shows 'No details available'.",
        },
      ],
    },
    {
      id: "qrcode",
      category: vi ? "Mã QR Thanh Toán" : "QR Code Payment",
      items: [
        {
          q: vi
            ? "Làm thế nào để tải mã QR ngân hàng lên?"
            : "How do I upload a bank QR code?",
          a: vi
            ? "Mở rộng buổi đánh (nhấn ►), ở phần 'Mã QR' bên phải, nhấn vào ô có dấu '+' để mở cửa sổ chọn file. Chọn ảnh QR từ thiết bị của bạn.\n\nGiới hạn:\n• Định dạng: JPG, PNG hoặc các định dạng ảnh phổ biến\n• Kích thước tối đa: 5MB\n\nSau khi chọn, hình ảnh xem trước sẽ hiện ra. Nhấn 'Show kết quả' để lưu và hiển thị mã QR cho người dùng trên trang /money."
            : "Expand the session (click ►), in the 'QR Code' section on the right, click the '+' area to open the file picker. Select the QR image from your device.\n\nLimits:\n• Format: JPG, PNG or common image formats\n• Maximum size: 5MB\n\nAfter selecting, a preview will appear. Click 'Show result' to save and display the QR code to users on the /money page.",
        },
        {
          q: vi
            ? "Mã QR được hiển thị ở đâu cho người dùng?"
            : "Where is the QR code shown to users?",
          a: vi
            ? "Sau khi admin nhấn 'Show kết quả', mã QR sẽ hiển thị trên trang phí vãng lai (/money) cùng với bảng kết quả tính tiền. Người dùng có thể quét mã QR bằng ứng dụng ngân hàng để chuyển khoản thanh toán."
            : "After the admin clicks 'Show result', the QR code appears on the fees page (/money) alongside the calculation result table. Users can scan the QR code with their banking app to make the payment transfer.",
        },
        {
          q: vi
            ? "Làm thế nào để xóa hoặc thay thế mã QR?"
            : "How do I remove or replace the QR code?",
          a: vi
            ? "Để xóa mã QR: nhấn nút 'x' (×) ở góc trên bên phải ảnh QR trong trang admin. Ảnh sẽ bị xóa khỏi preview.\nĐể thay mã QR mới: sau khi xóa, nhấn '+' để chọn ảnh mới.\nSau đó nhấn 'Show kết quả' để lưu thay đổi và cập nhật mã QR trên trang /money."
            : "To remove the QR: click the '×' button at the top-right of the QR image preview in the admin page. The image will be removed from the preview.\nTo replace with a new QR: after removing, click '+' to select a new image.\nThen click 'Show result' to save changes and update the QR on the /money page.",
        },
      ],
    },
    {
      id: "chatbot",
      category: vi ? "Chatbot AI Hỗ trợ" : "AI Chatbot Assistant",
      items: [
        {
          q: vi
            ? "Chatbot AI trong trang admin dùng để làm gì?"
            : "What is the AI chatbot in the admin panel for?",
          a: vi
            ? "Chatbot AI là trợ lý thông minh hỗ trợ admin. Bạn có thể:\n• Hỏi về danh sách người tham gia và tình trạng thanh toán\n• Nhờ AI giải thích hoặc gợi ý cách tính chi phí\n• Tải ảnh lên để chatbot phân tích (VD: ảnh hóa đơn sân, screenshot danh sách)\n• Hỏi các câu hỏi liên quan đến quản lý buổi đánh"
            : "The AI chatbot is an intelligent assistant for admins. You can:\n• Ask about participant lists and payment status\n• Ask AI to explain or suggest cost calculation methods\n• Upload images for the chatbot to analyze (e.g. court receipt photos, list screenshots)\n• Ask questions related to session management",
        },
        {
          q: vi
            ? "Làm thế nào để mở và sử dụng chatbot?"
            : "How do I open and use the chatbot?",
          a: vi
            ? "Nhấn vào biểu tượng chat ở góc dưới bên phải màn hình để mở cửa sổ chatbot. Gõ câu hỏi vào ô nhập liệu ở cuối cửa sổ và nhấn Enter hoặc nút gửi.\n\nBạn cũng có thể:\n• Phóng to cửa sổ chatbot bằng biểu tượng phóng to\n• Thu nhỏ chatbot mà không đóng bằng biểu tượng thu nhỏ"
            : "Click the chat icon in the bottom-right corner of the screen to open the chatbot window. Type your question in the input field at the bottom and press Enter or click the send button.\n\nYou can also:\n• Maximize the chatbot window using the maximize icon\n• Minimize the chatbot without closing it using the minimize icon",
        },
        {
          q: vi
            ? "Làm thế nào để bắt đầu cuộc trò chuyện mới với chatbot?"
            : "How do I start a new conversation with the chatbot?",
          a: vi
            ? "Nhấn nút 'Cuộc trò chuyện mới' ở trên cùng cửa sổ chatbot. Lịch sử trò chuyện cũ sẽ được xóa và bạn có thể bắt đầu lại từ đầu với câu hỏi mới."
            : "Click the 'New conversation' button at the top of the chatbot window. The previous conversation history will be cleared and you can start fresh with new questions.",
        },
        {
          q: vi
            ? "Tôi có thể tải ảnh lên để chatbot phân tích không?"
            : "Can I upload images for the chatbot to analyze?",
          a: vi
            ? "Có, chatbot hỗ trợ phân tích ảnh. Nhấn biểu tượng hình ảnh (upload image) trong ô nhập liệu của chatbot, chọn ảnh từ thiết bị. Ảnh tối đa 5MB. Ảnh sẽ được gửi kèm tin nhắn để AI phân tích và trả lời dựa trên nội dung ảnh."
            : "Yes, the chatbot supports image analysis. Click the image icon (upload image) in the chatbot input area, select an image from your device. Maximum 5MB. The image will be sent with your message for the AI to analyze and respond based on the image content.",
        },
      ],
    },
    {
      id: "userpage",
      category: vi ? "Trang Người Dùng" : "User-Facing Pages",
      items: [
        {
          q: vi
            ? "Trang chính (/) dành cho người dùng hoạt động như thế nào?"
            : "How does the main user page (/) work?",
          a: vi
            ? "Trang chính hiển thị lời mời tham gia buổi đánh cầu lông đang được admin chọn. Người dùng nhấn 'Đi' để đăng ký:\n1. Form đăng ký xuất hiện\n2. Nhập tên\n3. Chọn giới tính (Nam/Nữ)\n4. Nhập trình độ (tùy chọn: TB, TB+, TB-...)\n5. Nhấn 'OK' để xác nhận\n\nNếu nhấn 'Không đi' (các nút từ chối khác nhau), màn hình sẽ tiếp tục hỏi theo cách vui nhộn."
            : "The main page shows an invitation to the badminton session the admin has currently selected. Users click 'Go' to register:\n1. Registration form appears\n2. Enter name\n3. Select gender (Male/Female)\n4. Enter skill level (optional: TB, TB+, TB-...)\n5. Click 'OK' to confirm\n\nIf they click various 'No' buttons, the screen will continue asking in a playful way.",
        },
        {
          q: vi
            ? "Trang phí vãng lai (/money) hiển thị những gì?"
            : "What does the fees page (/money) show?",
          a: vi
            ? "Trang /money hiển thị danh sách tất cả buổi đánh đã được admin 'Show kết quả'. Với mỗi buổi:\n• Tên và thông tin buổi đánh\n• Bảng danh sách người tham gia với: Tên, Số tiền, Trạng thái thanh toán\n• Mã QR để chuyển khoản (nếu admin đã tải lên)\n\nNgười dùng không cần đăng nhập để xem trang này."
            : "The /money page shows all sessions for which the admin has clicked 'Show result'. For each session:\n• Session name and information\n• Participant table with: Name, Amount, Payment status\n• QR code for payment transfer (if the admin uploaded one)\n\nUsers do not need to log in to view this page.",
        },
        {
          q: vi
            ? "Tại sao người dùng không thể đăng ký buổi đánh?"
            : "Why can't a user register for a session?",
          a: vi
            ? "Các nguyên nhân có thể:\n• Admin chưa chọn buổi đánh nào làm buổi hiện tại\n• Buổi đánh đã bắt đầu — hệ thống tự khóa form đăng ký khi qua giờ đánh\n• Slot cho giới tính đó đã đầy — hiển thị '(hết)' trên nút chọn giới tính\n\nAdmin cần kiểm tra và: chọn buổi đánh, hoặc điều chỉnh số lượng slot, hoặc thêm người thủ công."
            : "Possible reasons:\n• The admin hasn't selected any session as the current active one\n• The session has already started — the system auto-locks registration after the session time\n• Slots for that gender are full — shown as '(full)' on the gender selection button\n\nAdmin should check and: select a session, adjust slot counts, or manually add the person.",
        },
        {
          q: vi
            ? "Người dùng đã đăng ký rồi có thể hủy đăng ký không?"
            : "Can a user cancel their registration after signing up?",
          a: vi
            ? "Hiện tại trang người dùng chưa có tính năng hủy đăng ký tự động. Nếu người dùng cần hủy, họ cần liên hệ admin để xóa tên khỏi danh sách. Admin vào trang quản lý, mở rộng buổi đánh và xóa người tham gia đó."
            : "Currently the user-facing page does not have a self-cancellation feature. If a user needs to cancel, they need to contact the admin to remove their name from the list. The admin opens the management page, expands the session, and deletes that participant.",
        },
      ],
    },
  ];
};

export const FAQPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const language = useSelector((state: RootState) => state.language.language);

  const [openSections, setOpenSections] = useState<string[]>(["overview"]);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqData = getFaqData(language);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const toggleItem = (key: string) => {
    setOpenItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div className="my-16 flex justify-center">
      <div className="max-w-4xl w-full px-2 sm:px-2 md:px-4 lg:px-6 xl:px-6 2xl:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 pb-4 border-b-2 border-gray-500">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-3xl font-primaryBold">
              {t("admin.faq.title")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 p-0.5 text-sm font-primaryMedium">
              <button
                onClick={() => dispatch(setLanguage("vi"))}
                className={`px-2.5 py-2 rounded-lg transition-colors ${language === "vi" ? "bg-yellow-400 hover:bg-yellow-500 shadow text-black" : "text-gray-500 hover:text-gray-700"}`}
              >
                VI
              </button>
              <button
                onClick={() => dispatch(setLanguage("en"))}
                className={`px-2.5 py-2 rounded-lg transition-colors ${language === "en" ? "bg-yellow-400 hover:bg-yellow-500 shadow text-black" : "text-gray-500 hover:text-gray-700"}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => navigate("/admin-ql-nnh-110-page")}
              className="text-black bg-gray-200 hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-3 py-2.5 flex items-center justify-center sm:w-24"
            >
              <ArrowTurnBackwardIcon className="sm:hidden" size={20} />
              <span className="hidden sm:inline">
                {t("admin.faq.backButton")}
              </span>
            </button>
          </div>
        </div>

        {/* Intro */}
        <p className="text-md font-primaryRegular text-gray-500 mb-8 -mt-4">
          {t("admin.faq.subtitle")}
        </p>

        {/* FAQ Sections */}
        <div className="space-y-3">
          {faqData.map((section) => (
            <div
              key={section.id}
              className="border border-gray-300 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex justify-between items-center px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <h2 className="text-base sm:text-lg font-primaryBold">
                  {section.category}
                </h2>
                <svg
                  className="w-5 h-5 transition-transform duration-200 flex-shrink-0 ml-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    transform: openSections.includes(section.id)
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Q&A Items */}
              {openSections.includes(section.id) && (
                <div className="divide-y divide-gray-100">
                  {section.items.map((item, idx) => {
                    const itemKey = `${section.id}-${idx}`;
                    const isOpen = openItems.includes(itemKey);
                    return (
                      <div key={itemKey}>
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full flex justify-between items-start px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="text-sm font-primaryMedium pr-4">
                            {item.q}
                          </span>
                          <svg
                            className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{
                              transform: isOpen
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4">
                            <p className="text-sm font-primaryRegular text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-sm font-primaryRegular text-gray-400 mt-8 text-center pb-8">
          {t("admin.faq.footer")}
        </p>
      </div>
    </div>
  );
};
