# fptech 

## 개요 

- BLDC-FM-090X Protocol.pdf 문서 참조할 것. 

## 프로토콜 제어문자

| 제어문자 | 코드값 | 제어 내용          |
| -------- | ------ | ------------------ |
| STX      | 0x02   | 통신데이터의 시작  |
| ESC      | 0x1b   | 통신 프로토콜 구분 |
| ETX      | 0x03   | 통신데이터의 끝    |


## 데이터 송/수신 패킷 구성 

| 헤더부 |     | identifier | data | checksum |
| ------ | --- | ---------- | ---- | -------- |
| STX    | ESC | OPCODE     | data | checksum |
| 0      | 1   | 2          | 2+ N | 3 + N    |


| 구분   | 항목   | 내용                    | 값   | 형식 | 크기 |
| ------ | ------ | ----------------------- | ---- | ---- | ---- |
| 헤더   | STX    | Start Transmission      | 0x02 | byte | 1    |
| 헤더   | ESC    | Escape                  | 0x1b | byte | 1    |
| 구분자 | OPCODE | 명령 메시지 유형        | 가변 | byte | 1    |
| DATA   | DATA   | 명령 유형에 따른 데이터 | 가변 | byte | N    |
| 체크섬 | 체크섬 | 데이터 오류 검사        | 가변 | byte | 1    |
| tail   | ETX    | End Transmission        | 0x03 | byte | 1    |

## 체크썸. 

- 데이터의 오류 검사를 위한 데이터로서 DATA 1 ~ DATA N까지의 값을 xor 한 후 마지막에 0x80 을 or 한 값이다. 

## 명령코드 

| OPCODE | 명칭          | PC   | 설명                         | 방향       |
| ------ | ------------- | ---- | ---------------------------- | ---------- |
| 0x41   | 상태정보요청  | 송신 | 릴레이,차단기,루프 상태 요청 | PC -> BLDC |
| 0x41   | 상태정보요청  | 수신 | 상태정보 전송                | PC <- BLDC |
| 0x42   | 동작제어      | 송신 |                              | PC -> BLDC |
| 0x42   | 동작제어      | 수신 |                              | PC <- BLDC |
| 0x43   | 설정정보 요청 | 송신 |                              | PC -> BLDC |
| 0x43   | 설정정보 요청 | 수신 |                              | PC <- BLDC |
| 0x44   | 기능설정      | 송신 |                              | PC -> BLDC |
| 0x44   | 기능설정      | 수신 |                              | PC <- BLDC |
| 0x45   | 제품정보요청  | 송신 |                              | PC -> BLDC |
| 0x45   | 제품정보요청  | 수신 |                              | PC <- BLDC |

## 세부명령 

### 상태정보 요청 

- 요청 

| stx  | esc  | opcode | data | checksum | etx  |
| ---- | ---- | ------ | ---- | -------- | ---- |
| 0x02 | 0x1b | 0x41   | 0x80 | 0x80     | 0x03 |

- 응답 

| byte  | bit   | 항목                     | 설명                            |
| ----- | ----- | ------------------------ | ------------------------------- |
| byte1 | bit 0 | relay 1 status           | 1 on, 0 off                     |
| byte1 | bit 1 | relay 1 time oper status | 0 무제한 동작, 1  시작제한 동작 |
| byte1 | bit 2 | relay 2 status           | 0 off, 1 on                     |
| byte1 | bit 3 | relay 2 time oper status |                                 |
| byte1 | bit 4 | relay 3 status           |                                 |
| byte1 | bit 5 | relay 3 time oper status |                                 |
| byte1 | bit 6 | reserved                 |                                 |
| byte1 | bit 7 | reserved                 | 1                               |
| byte2 | bit 0 | Up status                | 0 동작안함, 1 Up 동작중         |
| byte2 | bit 1 | up 완료 상태             | 0 동작안함 , 1 Up 동작완료      |
| byte2 | bit 2 | down 동작 상태           | 0 동작안함, 1 Down 동작중       |
| byte2 | bit 3 | down 완료 상태           | 0 동작안함, 1 Down 동작 완료    |
| byte2 | bit 4 | extra up status          | 0 동작안함, 1 Extra Up 동작 중  |
| byte2 | bit 5 | reserved                 |                                 |
| byte2 | bit 6 | reserved                 |                                 |
| byte2 | bit 7 | reserved                 | 1                               |



