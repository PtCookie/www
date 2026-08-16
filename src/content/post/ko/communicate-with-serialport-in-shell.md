---
title: "셸에서 시리얼포트 통신하기"
subtitle: "셸에서 시리얼포트와 통신하는 방법을 알아보았습니다."
brief: "하드웨어 중에는 시리얼포트 통신을 통해 장치 설정을 읽고 수정할 수 있는 장비들이 있습니다.\n특정 바이트 버퍼를 보내는 것으로 신호 입력 간격이나 센서 감도 등을 설정하거나, 현재 설정되어 있는 값을 읽을 수 있습니다.\n...\n\nconst serialInput = new SerialPort(...);\n\n// Set device configuration.\nserialInput.write(Buffer.from([0x00, ..., 0xff]));\n..."
slug: "communicate-with-serialport-in-shell"
locale: "ko"
publishedAt: "2023-12-02T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "shell"
    slug: "shell"
coverImage:
  url: "../../../assets/covers/ko/communicate-with-serialport-in-shell.jpeg"
  attribution: "https://unsplash.com/@marcusurbenz"
  photographer: "Marcus Urbenz"
---

하드웨어 중에는 시리얼포트 통신을 통해 장치 설정을 읽고 수정할 수 있는 장비들이 있습니다.

특정 바이트 버퍼를 보내는 것으로 신호 입력 간격이나 센서 감도 등을 설정하거나, 현재 설정되어 있는 값을 읽을 수 있습니다.

```typescript
...

const serialInput = new SerialPort(...);

// Set device configuration.
serialInput.write(Buffer.from([0x00, ..., 0xff]));

serialInput.on('data', (chunk: Buffer) => {
  // Read device configuration.

  ...

});

...
```

소량의 장비를 설정하려면 GUI 프로그램을 통해 설정하거나 위와 같은 Node.js 스크립트를 사용하면 편리하겠지만, 대량의 장비를 설정하기에는 적합하지 않습니다.
각 장비에 Node.js를 설치해야하며, 각 장비를 연결하고 해제하는 것도 일이고, 이미 설치되어있는 장비들이라면 원래 위치에 복구시켜놓아야 합니다.

그래서 셸 스크립트로 진행할 수 없는지 조사해보았습니다.

## PowerShell (Windows)

사용 중인 장비가 Windows PC에 연결되어 있어, PowerShell 스크립트를 사용했습니다.

PowerShell에서는 시리얼포트 통신을 위해 .NET의 함수와 객체를 사용할 수 있습니다.

```powershell
# Get list of port name.
[System.IO.Ports.SerialPort]::GetPortNames()

# Create port object and open it.
$port = New-Object System.IO.Ports.SerialPort COM8,115200,None,8,One
$port.open()
```

### Read

위와 같이 포트를 열고, 값을 읽어 인코딩하여 확인할 수 있습니다.

```powershell
$getBuffer = $port.ReadExisting()
$getResponse = [System.Text.Encoding]::UTF8.GetBytes($getBuffer)
$getResponse
```

### Write

통신의 페이로드의 경우 타입을 명시한 배열로 만들 수 있습니다.

```powershell
[byte[]] $setCmd = 0x00,...,...,...,0xFF
```

이전에 열어둔 포트에 해당 배열을 써서 전송합니다.

```powershell
$port.Write($setCmd, 0, $setCmd.Count)
```

### Communicate

종합하면 다음과 같은 스크립트를 만들 수 있습니다.

```powershell
[byte[]] $getCmd = 0x00,...,...,...,0xFF
[byte[]] $setCmd = 0x00,...,...,...,0xFF

# Create port object and open it.
$port = New-Object System.IO.Ports.SerialPort COM8,115200,None,8,One
$port.open()

# Check current config value.
$port.Write($getCmd, 0, $getCmd.Count)
$getBuffer = $port.ReadExisting()
$getResponse = [System.Text.Encoding]::UTF8.GetBytes($getBuffer)
$getResponse

# Set config value.
$port.Write($setCmd, 0, $setCmd.Count)

# Close port.
$port.Close()
```

## Appendix for Linux

Linux의 경우 몇 가지 명령어를 사용해 시리얼포트와 통신할 수 있습니다.
이 때 권한이 없는 경우, 적절한 권한을 추가하여 사용할 수 있습니다.

```sh
# Add to proper group and re-login.
usermod -aG dialout $USER
```

### Read

읽기의 경우 `cat`을 사용할 수 있습니다.

```sh
cat < /dev/ttyUSB0
```

바이트 버퍼를 읽는 경우 `od`를 사용할 수 있습니다.

```sh
od -t x1 < /dev/ttyUSB0
```

### Write

리다이렉트 연산자 `>`를 사용해서 시리얼포트에 값을 쓸 수 있습니다.

```sh
echo 'Hello' >/dev/ttyUSB0
```

바이트 버퍼를 보내는 경우, `echo` 플래그로 백슬래시를 위한 이스케이프 및 EOL을 제거를 추가하여 쓰는 것이 좋습니다.

```sh
echo -en '\x00...\xff' >/dev/ttyUSB0
```

## Reference

- [Writing and Reading info from Serial Ports - PowerShell Team](https://devblogs.microsoft.com/powershell/writing-and-reading-info-from-serial-ports/)
- [SerialPort 클래스 (System.IO.Ports) | Microsoft Learn](https://learn.microsoft.com/ko-kr/dotnet/api/system.io.ports.serialport?view=dotnet-plat-ext-8.0)

- [bash(1) — Arch manual pages](https://man.archlinux.org/man/core/bash/bash.1.en#REDIRECTION)
- [od(1) — Arch manual pages](https://man.archlinux.org/man/od.1)
