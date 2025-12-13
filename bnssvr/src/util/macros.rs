#[macro_export]
macro_rules! fln {
  ($msg:expr) => {
    format!("{} ({}:{})", $msg, crate::util::err_file_name(file!()), line!())
  };
}

#[macro_export]
macro_rules! flnf {
  ($($arg:tt)*) => {
    format!("{} ({}:{})", format!($($arg)*), crate::util::err_file_name(file!()), line!())
  };
}

#[macro_export]
macro_rules! ectx {
  ($e:expr, $msg:expr) => {
    $e.context(format!("{} ({}:{})", $msg, crate::util::err_file_name(file!()), line!()))
  };
}

#[macro_export]
macro_rules! ectxf {
  ($e:expr, $($arg:tt)*) => {
    $e.context(format!("{} ({}:{})", format!($($arg)*), crate::util::err_file_name(file!()), line!()))
  };
}

#[macro_export]
macro_rules! err {
  ($e:expr, $msg:expr) => {
    anyhow::Error::from($e).context(crate::fln!($msg))
  };
}

#[macro_export]
macro_rules! errf {
  ($e:expr, $($arg:tt)*) => {
    anyhow::Error::from($e).context(crate::flnf!($($arg)*))
  };
}

#[macro_export]
macro_rules! eanyhowf {
  ($($arg:tt)*) => {
    anyhow::anyhow!(crate::flnf!($($arg)*))
  };
}

#[macro_export]
macro_rules! eanyhow {
  ($msg:expr) => {
    anyhow::anyhow!(crate::fln!($msg))
  };
}
