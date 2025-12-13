#![cfg(test)]

use crate::ebrd::pkt::pkt::{Cmd, CtlChar, Pkt};

#[test]
fn test_pkt() {
  let pkt = Pkt::new();
  assert_eq!(pkt.stx, CtlChar::Stx);
  assert_eq!(pkt.etx, CtlChar::Etx);
  assert_eq!(pkt.len, 0x0);
  assert_eq!(pkt.cmd, Cmd::Id);
  assert_eq!(pkt.id, "");
  assert_eq!(pkt.data, Vec::<u8>::new());
}
