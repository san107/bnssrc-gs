use once_cell::sync::Lazy;

pub static LOG_EBRD_PKT_SEND: Lazy<bool> = Lazy::new(|| crate::util::get_env_bool("LOG_EBRD_PKT_SEND", false));
pub static LOG_EBRD_PKT_RECV: Lazy<bool> = Lazy::new(|| crate::util::get_env_bool("LOG_EBRD_PKT_RECV", false));

pub static SOCK_TMO_CONN: Lazy<u64> = Lazy::new(|| crate::util::get_env_u64("SOCK_TMO_CONN", 5000));
pub static EBRD_TMO_SEND: Lazy<u64> = Lazy::new(|| crate::util::get_env_u64("EBRD_TMO_SEND", 8000));
