pub fn get_read_addr(no: &Option<i32>) -> u16 {
  let gate_idx = if no.is_none() { 0 } else { (no.unwrap() - 1) as u16 };
  super::pkt::BASE_READ_ADDR + gate_idx * 10
}

pub fn get_write_addr(no: &Option<i32>) -> u16 {
  let gate_idx = if no.is_none() { 0 } else { (no.unwrap() - 1) as u16 };
  super::pkt::BASE_WRITE_ADDR + gate_idx * 10
}

pub fn get_water_sensor_addr(no: &Option<i32>) -> u16 {
  let gate_idx = if no.is_none() { 0 } else { (no.unwrap() - 1) as u16 };
  super::pkt::WATER_SENSOR_ADDR + gate_idx * 10
}

pub fn get_water_analog_addr(no: &Option<i32>) -> u16 {
  let gate_idx = if no.is_none() { 0 } else { (no.unwrap() - 1) as u16 };
  super::pkt::WATER_ANALOG_ADDR + gate_idx * 10
}

pub fn get_cmd_timeout_secs() -> u64 {
  50
}