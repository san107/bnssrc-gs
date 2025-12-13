use migration::m20250517_055105_tb_ncd::TbNcd;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    let db = manager.get_connection();
    db.execute_unprepared("delete from tb_ncd").await?; // 우선 삭제하고 나서.

    enum SN<'a> {
      S(&'a str),
      N(i32),
      SEQ(),
    }
    use SN::*;
    let list = [
      // 그룹
      [S("EndSpd"), N(1), S("아주 빠르게"), SEQ()],
      [S("EndSpd"), N(2), S("조금 빠르게"), SEQ()],
      [S("EndSpd"), N(3), S("빠르게"), SEQ()],
      [S("EndSpd"), N(4), S("보통 빠르게"), SEQ()],
      [S("EndSpd"), N(5), S("느리게"), SEQ()],
      [S("EndSpd"), N(6), S("보통 느리게"), SEQ()], // NOA LED 요청에 따라서 변경.
      //
      [S("EndEfct"), N(5), S("바로 사라짐"), SEQ()],
      [S("EndEfct"), N(7), S("좌측으로 스크롤"), SEQ()],
      [S("EndEfct"), N(1), S("위로 스크롤"), SEQ()],
      [S("EndEfct"), N(2), S("아래로 스크롤"), SEQ()],
      [S("EndEfct"), N(3), S("위,아래로 벌어짐"), SEQ()],
      [S("EndEfct"), N(4), S("중심으로 모여듬"), SEQ()],
      [S("EndEfct"), N(6), S("문자회전하며 사라짐"), SEQ()],
      [S("EndEfct"), N(8), S("화면 반전"), SEQ()],
      [S("EndEfct"), N(9), S("좌우로 확대되면서 사라짐"), SEQ()],
      [S("EndEfct"), N(10), S("중심으로 축소되면서 사라짐"), SEQ()],
      [S("EndEfct"), N(11), S("좌우역상으로 확대되면서 사라짐"), SEQ()],
      [S("EndEfct"), N(12), S("깜빡임"), SEQ()],
      //
      [S("StartEfct"), N(1), S("바로표시"), SEQ()],
      [S("StartEfct"), N(2), S("좌측으로 스크롤"), SEQ()],
      [S("StartEfct"), N(3), S("위로 스크롤"), SEQ()],
      [S("StartEfct"), N(4), S("아래로 스크롤"), SEQ()],
      [S("StartEfct"), N(5), S("레이저 효과"), SEQ()],
      [S("StartEfct"), N(6), S("위, 아래로 벌어짐"), SEQ()],
      [S("StartEfct"), N(7), S("중심으로 모여듬"), SEQ()],
      [S("StartEfct"), N(8), S("문자회전 display"), SEQ()],
      [S("StartEfct"), N(9), S("Line회전 display"), SEQ()],
      [S("StartEfct"), N(10), S("문자회전 change"), SEQ()],
      [S("StartEfct"), N(11), S("Line회전 change"), SEQ()],
      [S("StartEfct"), N(12), S("문자위, 아래로 이동1"), SEQ()],
      [S("StartEfct"), N(13), S("문자위, 아래로 이동2"), SEQ()],
      [S("StartEfct"), N(14), S("역상 큰상태에서 표시(느리게)"), SEQ()],
      [S("StartEfct"), N(15), S("역상 큰상태에서 (빠르게)"), SEQ()],
      [S("StartEfct"), N(16), S("현재시간 표시"), SEQ()],
      [S("StartEfct"), N(17), S("왼쪽으로 모두 스크롤"), SEQ()],
      [S("StartEfct"), N(18), S("깜빡임"), SEQ()],
      //
      [S("StartSpd"), N(1), S("아주 빠르게"), SEQ()],
      [S("StartSpd"), N(2), S("조금 빠르게"), SEQ()],
      [S("StartSpd"), N(3), S("빠르게"), SEQ()],
      [S("StartSpd"), N(4), S("보통 빠르게"), SEQ()],
      [S("StartSpd"), N(5), S("느리게"), SEQ()],
      [S("StartSpd"), N(6), S("보통 느리게"), SEQ()], // NOA LED 요청에 따라서 변경.
      // 에러코드.
      [S("EbrdErr"), N(1), S("방번호 이상"), SEQ()],
      [S("EbrdErr"), N(2), S("표시효과 이상"), SEQ()],
      [S("EbrdErr"), N(3), S("표시속도 이상"), SEQ()],
      [S("EbrdErr"), N(4), S("완료효과 이상"), SEQ()],
      [S("EbrdErr"), N(5), S("완료속도 이상"), SEQ()],
      [S("EbrdErr"), N(6), S("문자 크기 이상"), SEQ()],
      [S("EbrdErr"), N(7), S("Command 이상"), SEQ()],
      [S("EbrdErr"), N(8), S("font 선택 이상"), SEQ()],
      [S("EbrdErr"), N(9), S("방정보 없음"), SEQ()],
    ];
    let mut insert = Query::insert()
      .into_table(TbNcd::Table)
      .columns([TbNcd::NcdGrp, TbNcd::NcdId, TbNcd::NcdNm, TbNcd::NcdSeq])
      .to_owned();

    for (idx, ele) in list.iter().enumerate() {
      insert = insert
        .values_panic(ele.iter().map(|ele| match ele {
          SN::S(s) => (*s).into(),
          SN::N(n) => ((*n) as i32).into(),
          SN::SEQ() => ((idx + 1) as i32).into(),
        }))
        .to_owned();
    }

    manager.exec_stmt(insert).await?;

    Ok(())
  }

  async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
    Ok(())
  }
}
