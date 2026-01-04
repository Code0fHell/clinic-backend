# Unit Test Documentation

## Tổng quan

Dự án đã được bổ sung đầy đủ unit test cho các module chính với độ phủ cao:

1. **Appointment Service** - Đặt lịch hẹn
2. **Visit Service** - Tạo lượt khám
3. **Medical Ticket Service** - Tạo phiếu khám
4. **Bill Service** - Tạo hóa đơn
5. **Indication Service** - Tạo phiếu chỉ định cận lâm sàng
6. **Imaging Service** - Tạo kết quả chẩn đoán hình ảnh
7. **Lab Test Result Service** - Tạo kết quả xét nghiệm
8. **Prescription Service** - Tạo đơn thuốc

## Chạy Test

### Chạy tất cả test
```bash
npm test
```

### Chạy test với coverage report
```bash
npm run test:cov
```

### Chạy test ở chế độ watch
```bash
npm run test:watch
```

### Chạy test cho một file cụ thể
```bash
npm test -- appointment.service.spec.ts
```

## Coverage Report

Sau khi chạy `npm run test:cov`, coverage report sẽ được tạo trong thư mục `coverage/`:

- **HTML Report**: `coverage/index.html` - Mở file này trong trình duyệt để xem chi tiết
- **LCOV Report**: `coverage/lcov.info` - Dùng cho các công cụ CI/CD
- **JSON Summary**: `coverage/coverage-summary.json` - Dữ liệu JSON về coverage

### Coverage Threshold

Dự án đã thiết lập ngưỡng coverage tối thiểu:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Nếu coverage dưới ngưỡng này, test sẽ fail.

## Cấu trúc Test

Mỗi file test (`*.spec.ts`) bao gồm:

1. **Setup**: Mock các repository và dependencies
2. **Test Cases**: 
   - Happy path (trường hợp thành công)
   - Error cases (trường hợp lỗi)
   - Edge cases (trường hợp biên)
3. **Cleanup**: Reset mocks sau mỗi test

## Mock Database

Tất cả các test đều sử dụng mock cho database repositories để:
- Không cần kết nối database thật
- Test chạy nhanh
- Dễ dàng kiểm soát dữ liệu test
- Đảm bảo test độc lập

## Các Test Case Chính

### Appointment Service
- ✅ Đặt lịch thành công
- ✅ Đặt lịch với ngày không hợp lệ
- ✅ Đặt lịch khi slot đã được đặt
- ✅ Đặt lịch cho khách (guest)
- ✅ Lấy danh sách lịch hẹn
- ✅ Cập nhật trạng thái lịch hẹn

### Visit Service
- ✅ Tạo lượt khám với appointment
- ✅ Tạo lượt khám walk-in
- ✅ Tạo lượt khám với medical record
- ✅ Cập nhật trạng thái visit
- ✅ Lấy danh sách queue hôm nay

### Medical Ticket Service
- ✅ Tạo phiếu khám thành công
- ✅ Trả về phiếu khám đã tồn tại
- ✅ Tạo phiếu khám với barcode unique
- ✅ Xử lý lỗi khi không thể tạo barcode

### Bill Service
- ✅ Tạo hóa đơn phí khám (CLINICAL)
- ✅ Tạo hóa đơn dịch vụ (SERVICE)
- ✅ Tạo hóa đơn thuốc (MEDICINE)
- ✅ Tính toán tổng tiền từ prescription details
- ✅ Lấy danh sách hóa đơn hôm nay

### Indication Service
- ✅ Tạo phiếu chỉ định thành công
- ✅ Tự động xác định loại chỉ định (TEST/IMAGING)
- ✅ Tạo medical record nếu chưa có
- ✅ Tính toán queue number
- ✅ Lấy danh sách chỉ định lab hôm nay

### Imaging Service
- ✅ Tạo kết quả X-ray thành công
- ✅ Upload nhiều ảnh
- ✅ Kiểm tra quyền bác sĩ chẩn đoán
- ✅ Lấy kết quả theo bệnh nhân
- ✅ Lấy kết quả theo chỉ định

### Lab Test Result Service
- ✅ Tạo kết quả xét nghiệm thành công
- ✅ Cập nhật test_result cho service indication
- ✅ Kiểm tra quyền nhân viên lab
- ✅ Lấy kết quả theo bệnh nhân
- ✅ Lấy kết quả theo chỉ định

### Prescription Service
- ✅ Tạo đơn thuốc thành công
- ✅ Tạo đơn thuốc với nhiều loại thuốc
- ✅ Tính toán tổng phí
- ✅ Duyệt đơn thuốc và cập nhật tồn kho
- ✅ Kiểm tra tồn kho trước khi duyệt
- ✅ Lấy danh sách đơn thuốc chờ duyệt

## Best Practices

1. **Mỗi test case độc lập**: Không phụ thuộc vào thứ tự chạy
2. **Mock đầy đủ**: Tất cả dependencies đều được mock
3. **Test cả success và error**: Đảm bảo test cả trường hợp thành công và lỗi
4. **Clear test names**: Tên test mô tả rõ ràng điều gì đang được test
5. **Cleanup**: Reset mocks sau mỗi test để tránh side effects

## Troubleshooting

### Test fail với lỗi "Cannot find module"
- Đảm bảo đã cài đặt dependencies: `npm install`
- Kiểm tra đường dẫn import trong test file

### Coverage thấp
- Chạy `npm run test:cov` để xem chi tiết
- Mở `coverage/index.html` để xem dòng code nào chưa được test
- Bổ sung test cases cho các nhánh code chưa được cover

### Test chạy chậm
- Đảm bảo đang dùng mock, không kết nối database thật
- Kiểm tra xem có test nào đang chờ timeout không

## CI/CD Integration

Coverage report có thể được tích hợp vào CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests with coverage
  run: npm run test:cov

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Liên hệ

Nếu có vấn đề với test, vui lòng kiểm tra:
1. Console output khi chạy test
2. Coverage report để xem dòng code nào fail
3. Test file để xem mock có đúng không






