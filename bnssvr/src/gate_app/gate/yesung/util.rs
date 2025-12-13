pub fn get_read_addr(no: &Option<i32>) -> u16 {
  let gate_idx = if no.is_none() { 0 } else { (no.unwrap() - 1) as u16 };

  // M0030, M0033, M0036... (주소 간격 3?)
  // 또는 M0030, M0040, M0050... (주소 간격 10?)
  // 실제 간격은 현장 확인 필요!
  super::pkt::BASE_READ_ADDR + gate_idx * 10 // 일단 10으로 가정
}

pub fn get_write_addr(no: &Option<i32>) -> u16 {
  let gate_idx = if no.is_none() { 0 } else { (no.unwrap() - 1) as u16 };

  super::pkt::BASE_WRITE_ADDR + gate_idx * 10 // 일단 10으로 가정
}

pub fn get_cmd_timeout_secs() -> u64 {
  50
}
