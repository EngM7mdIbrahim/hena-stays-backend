class OtpService {
  generateOtp() {
    // Generate OTP 4 digit number between 1000 and 9999
    return Math.floor(1000 + Math.random() * 9000)
  }
  async verifyOtp() {
    // Verify OTP
  }

  async sendOtp() {
    // Send OTP
    const otp = await this.generateOtp()
    return { otp }
  }
}

export const otpService = new OtpService()
