class CustomError extends Error{
    constructor(code,message, description)
    {
        super('{"code": "' + code + '", "message": "' + message + '", "description": "' + description + '"}');
        this.code = code; // Hata kodunu ayarlar
        this.message = message; // Hata mesajını ayarlar
        this.description = description; // Hata açıklamasını ayarlar
    }
}

module.exports = CustomError; // Bu modülü dışa aktarır, böylece diğer dosyalarda kullanılabilir hale getirir