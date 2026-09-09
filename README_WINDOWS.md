# Windows Setup

Troubleshooting guide for setting up the development environment on Windows.

## Problem 1: Git Bash and Perl conflict

If you installed Git Bash on Windows, it ships with its own `perl.exe` which interferes with the build process for `cargo-leptos`.

**Fix:**

* Install [Strawberry Perl](https://strawberryperl.com/) separately
* Add its `/bin` directory to your system PATH
* Make sure Strawberry Perl comes **before** Git Bash in PATH priority
* Use PowerShell (or another terminal) instead of Git Bash so the separately installed Perl takes priority

**Note:** Leptos installation can take up to 40 minutes on Windows by default.


## Problem 2: OpenSSL setup on Windows

The Rust/OpenSSL guide covers Linux and macOS but skips Windows entirely.

**Fix:**

* Download and install OpenSSL from [Shining Light Productions (MSI installer)](https://slproweb.com/products/Win32OpenSSL.html)
* During setup, select: "The OpenSSL binaries (/bin) directory"
* Add this to PATH:
  `C:\OpenSSL-Win64\bin`
* Create an environment variable:
  `OPENSSL_DIR = C:\OpenSSL-Win64`
