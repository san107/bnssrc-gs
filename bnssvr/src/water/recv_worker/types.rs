use crate::{
  emcall_app::model::ItgEvent,
  models::cd::{CommStat, WaterStat},
  ws::wsmodels::GrpAction,
};

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub enum WaterRecvCmd {
  Text(String),
  ItgEvt(ItgEvent),
  IstecEvt(serde_json::Value),
  HpOnoffEvt(i32, bool, bool),
  HpAnalogEvt(i32, f64),
  YesungOnoffEvt(i32, bool, bool),  // 예성 접점식 (3cm, 5cm)
  YesungAnalogEvt(i32, f64),        // 예성 아날로그 (0-30cm)
  GrpCommStat(i32, CommStat), // 그룹에 속해있는 수위계가 통신상태 변경시 전송 됨.
  GrpWaterStat(i32, WaterStat),
  GrpAction(String, GrpAction),
}
