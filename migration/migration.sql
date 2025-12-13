-- history of databse 
-- 2025-06-21 전광판 테이블에 카메라 일련번호 추가.
ALTER TABLE
    tb_ebrd
ADD
    cam_seq INT NULL COMMENT '카메라일련번호';

-- end of file.