# 시스템 베이스 프로토콜 정리. 

## 개요 

### Network Setting. 

- Operation Setting 에서 Operation Mode를 Modbus TCP 로 선택한다. 
- Modbus Slave ID 를 1로 설정한다. 

## Open 

- 전체 0 상태에서, AC Relay1(1) 를 On / Off 처리한다. 

## On

- 전체 0 상태에서, AC Relay2(2) 르 On / Off 처리한다. 

## 상태관리. 

- modbus 데이터를 읽어서 처리할 수 있는 내용이 아니다. 
- 즉 상태 관리가 되지 않음. 
- 접속 가능여부만 설정하도록 한다. 

