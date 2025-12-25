// 읽기 주소들
pub fn get_read_remote_addr(_no: &Option<i32>) -> u16 {
  super::pkt::READ_REMOTE_ADDR // 0
}

pub fn get_read_up_ok_addr(_no: &Option<i32>) -> u16 {
  super::pkt::READ_UP_OK_ADDR // 8
}

pub fn get_read_down_ok_addr(_no: &Option<i32>) -> u16 {
  super::pkt::READ_DOWN_OK_ADDR // 9
}

// 쓰기 주소들
pub fn get_write_up_addr(_no: &Option<i32>) -> u16 {
  super::pkt::WRITE_UP_ADDR // 2
}

pub fn get_write_down_addr(_no: &Option<i32>) -> u16 {
  super::pkt::WRITE_DOWN_ADDR // 3
}

pub fn get_write_stop_addr(_no: &Option<i32>) -> u16 {
  super::pkt::WRITE_STOP_ADDR // 4
}

// 수위계 주소들
pub fn get_water_3cm_addr(_no: &Option<i32>) -> u16 {
  super::pkt::WATER_3CM_ADDR // 5
}

pub fn get_water_5cm_addr(_no: &Option<i32>) -> u16 {
  super::pkt::WATER_5CM_ADDR // 6
}

pub fn get_water_analog_addr(_no: &Option<i32>) -> u16 {
  super::pkt::WATER_ANALOG_ADDR // 92
}

pub fn get_cmd_timeout_secs() -> u64 {
  50
}
