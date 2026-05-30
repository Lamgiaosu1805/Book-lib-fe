export const ADMIN_PASSWORD_RULE = 'Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, số và ký tự đặc biệt';

export function validateAdminPassword(password: string): string {
    if (password.length < 6) return 'Mật khẩu mới phải có ít nhất 6 ký tự';
    if (!/[A-Z]/.test(password)) return 'Mật khẩu mới phải có ít nhất 1 chữ hoa';
    if (!/[0-9]/.test(password)) return 'Mật khẩu mới phải có ít nhất 1 chữ số';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt';
    return '';
}
