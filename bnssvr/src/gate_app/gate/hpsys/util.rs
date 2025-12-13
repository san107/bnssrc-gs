pub fn get_gate_idx(no: &Option<i32>) -> u16 {
  if no.is_none() {
    0
  } else {
    (no.unwrap() - 1) as u16
  }
}

pub fn get_gate_addr(no: &Option<i32>) -> u16 {
  super::pkt::BASE_ADDR + get_gate_idx(no) * 2 // read, write address pair ==> * 2
}

pub fn get_cmd_timeout_secs() -> u64 {
  50
}
