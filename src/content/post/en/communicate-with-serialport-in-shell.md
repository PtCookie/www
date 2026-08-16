---
title: "Communicate with serialport in shell"
subtitle: "Find out the way to communicate with serialport in shell."
brief: "Many hardwares can be managed by serialport communication, set values and get configured values.\nHardware settings, such as signal interval or sensor sensitivity, can be set or retrieved current values by sending specific byte buffer.\n...\n\nconst seri..."
slug: "communicate-with-serialport-in-shell"
locale: "en"
publishedAt: "2023-12-02T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "shell"
    slug: "shell"
coverImage:
  url: "../../../assets/covers/en/communicate-with-serialport-in-shell.jpeg"
  attribution: "https://unsplash.com/@marcusurbenz"
  photographer: "Marcus Urbenz"
---

Many hardwares can be managed by serialport communication, set values and get configured values.

Hardware settings, such as signal interval or sensor sensitivity, can be set or retrieved current values by sending specific byte buffer.

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

Setting up a small amount of hardware would be convenient through the GUI program or using the Node.js script above, but it is not suitable for setting up a large amount of hardware.
Node.js must be installed on each machine, and it is also a other work to connect and release each machine, and if they are already in use, they must be relocated to their original location.

So I looked into whether I could proceed with the shell script.

## PowerShell (Windows)

Let's use PowerShell, as hardware to manage is connected to Windows PC.

In PowerShell, you can use .NET functions and object to serialport communication.

```powershell
# Get list of port name.
[System.IO.Ports.SerialPort]::GetPortNames()

# Create port object and open it.
$port = New-Object System.IO.Ports.SerialPort COM8,115200,None,8,One
$port.open()
```

### Read

Open port like above, and encode input bytes to check configured value.

```powershell
$getBuffer = $port.ReadExisting()
$getResponse = [System.Text.Encoding]::UTF8.GetBytes($getBuffer)
$getResponse
```

### Write

Use typed array for payload.

```powershell
[byte[]] $setCmd = 0x00,...,...,...,0xFF
```

Write this array to opened port.

```powershell
$port.Write($setCmd, 0, $setCmd.Count)
```

### Communicate

Taken together, you can create the following scripts.

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

On Linux, you can use several commands to communicate with the serialport.
If you do not have permissions, you can add yourself to appropreiate group.

```sh
# Add to proper group and re-login.
usermod -aG dialout $USER
```

### Read

You can use `cat` to read serialport data.

```sh
cat < /dev/ttyUSB0
```

In case of byte buffer, you can use `od`.

```sh
od -t x1 < /dev/ttyUSB0
```

### Write

You can write to serialport using redirect operator `>`.

```sh
echo 'Hello' >/dev/ttyUSB0
```

In case of byte buffer, you'd better use command flag of `echo` for escape for backslash and EOL removal.

```sh
echo -en '\x00...\xff' >/dev/ttyUSB0
```

## Reference

- [Writing and Reading info from Serial Ports - PowerShell Team](https://devblogs.microsoft.com/powershell/writing-and-reading-info-from-serial-ports/)
- [SerialPort Class (System.IO.Ports) | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/system.io.ports.serialport?view=dotnet-plat-ext-8.0)

- [bash(1) — Arch manual pages](https://man.archlinux.org/man/core/bash/bash.1.en#REDIRECTION)
- [od(1) — Arch manual pages](https://man.archlinux.org/man/od.1)
