use bitflags::bitflags;

//pub const CMD_ADDR: u16 = 8 - 1; // 1을 빼지 않고 처리하도록 되어 있음.
pub const CMD_ADDR: u16 = 8;

bitflags! {
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct RealsysAddr:u16{
        const down = 0b0000_0001;
        const up = 0b0000_0010;
    }
}

pub fn get_realsys_down_cmd() -> u16 {
  return RealsysAddr::down.bits();
}

pub fn get_realsys_up_cmd() -> u16 {
  return RealsysAddr::up.bits();
}
