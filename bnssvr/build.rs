use vergen::{BuildBuilder, Emitter};

fn main() -> Result<(), Box<dyn std::error::Error>> {
  // 모든 소스 파일이 변경되었을 때도 빌드 스크립트가 실행되도록 설정
  println!("cargo:rerun-if-changed=src/");
  //
  // NOTE: This will output everything, and requires all features enabled.
  // NOTE: See the specific builder documentation for configuration options.
  let build = BuildBuilder::all_build()?;
  //   let cargo = CargoBuilder::all_cargo()?;
  //   let rustc = RustcBuilder::all_rustc()?;
  //   let si = SysinfoBuilder::all_sysinfo()?;

  Emitter::default()
    .add_instructions(&build)?
    // .add_instructions(&cargo)?
    // .add_instructions(&rustc)?
    // .add_instructions(&si)?
    .emit()?;

  Ok(())
}
