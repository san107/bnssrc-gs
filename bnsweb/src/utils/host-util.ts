// 100 이하의 포트를 현재 접속한 100 단위에 연결하는 구조.
// 즉, 포트포워딩하여 사용할 수 있도록 처리하기 위함.
// 예를들어서, 3012 를 사용한다고 하면,
// 현재 접속한 100 단위 포트에, 12를 사용하는 구조이다.
// 3012가 아규먼트이고, 접속중인 포트가 3100 이면, 3112 를 반환하는 방식이다.
export const getDynamicPort = (origPort: number): number => {
  origPort = origPort % 100;
  const u = new URL(document.location.href);
  const hostPort = Number(u.port);
  const dynamicPort = Math.floor(hostPort / 100) * 100 + origPort;
  return dynamicPort;
};
