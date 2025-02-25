using Dapper;
using Microsoft.AspNetCore.Mvc;
using Oracle.ManagedDataAccess.Client;
using OutilTransactionEnLigne.Server.Models;
using System.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.Security.Cryptography;
using OutilTransactionEnLigne.Server.Services;

namespace OutilTransactionEnLigne.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OracleDataController : ControllerBase
    {
        private readonly IConfiguration _config;

        public OracleDataController(IConfiguration config)
        {
            _config = config;
        }

        [Authorize]
        [HttpGet("utilisateurs")]
        public async Task<IActionResult> GetUtilisateurs()
        {
            try
            {
                using (IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection")))
                {
                    var utilisateurs = await connection.QueryAsync<Utilisateur>(
                        "SELECT * FROM UTILISATEUR");

                    return Ok(utilisateurs);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                using (var connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection")))
                {
                    await connection.OpenAsync();
                    return Ok("Connection successful");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Connection failed: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                using (IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection")))
                {
                    var utilisateur = await connection.QueryFirstOrDefaultAsync<Utilisateur>(
                        "SELECT * FROM UTILISATEUR WHERE EMAIL = :Email",
                        new { Email = loginRequest.Email });

                    if (utilisateur == null)
                    {
                        return Unauthorized("Utilisateur non trouvé.");
                    }

                    // Vérifiez le mot de passe haché
                    if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, utilisateur.Password))
                    {
                        return Unauthorized("Mot de passe incorrect.");
                    }

                    // Générer un code OTP à 6 chiffres
                    var otp = GenerateOtp();
                    var emailService = new EmailService(_config);

                    // Envoyer le code OTP par e-mail
                    emailService.SendEmail(utilisateur.Email, "Code de confirmation", $"Votre code de confirmation est : {otp}");

                    // Stocker le code OTP temporairement (par exemple, en mémoire ou dans une base de données)
                    // Ici, nous utilisons un dictionnaire en mémoire pour simplifier
                    _otpStore[utilisateur.Email] = otp;

                    return Ok(new { Message = "Code de confirmation envoyé par e-mail.", Email = utilisateur.Email });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private static string GenerateOtp()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString(); // Code à 6 chiffres
        }

        // Dictionnaire pour stocker les codes OTP temporairement
        private static readonly Dictionary<string, string> _otpStore = new();

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest verifyOtpRequest)
        {
            try
            {
                if (!_otpStore.TryGetValue(verifyOtpRequest.Email, out var storedOtp))
                {
                    return BadRequest("Aucun code OTP trouvé pour cet e-mail.");
                }

                if (storedOtp != verifyOtpRequest.Otp)
                {
                    return Unauthorized("Code OTP incorrect.");
                }

                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));

                // Récupérer l'utilisateur
                var utilisateur = await connection.QueryFirstOrDefaultAsync<Utilisateur>(
                    "SELECT * FROM UTILISATEUR WHERE EMAIL = :Email",
                    new { Email = verifyOtpRequest.Email });

                // Générer le token JWT
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                new Claim(ClaimTypes.Name, verifyOtpRequest.Email),
                new Claim(ClaimTypes.NameIdentifier, utilisateur.Id.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    Issuer = _config["Jwt:Issuer"],
                    Audience = _config["Jwt:Audience"],
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                // Enregistrer la session
                var sql = @"
            INSERT INTO SESSIONS (ID, USER_ID, TOKEN,CREATED_AT, EXPIRED_AT) 
            VALUES (SESSIONS_SEQ.NEXTVAL, :UserId, :Token,:CreatedAt, :ExpiredAt)";

                await connection.ExecuteAsync(sql, new
                {
                    UserId = utilisateur.Id,
                    Token = tokenString,
                    CreatedAt = DateTime.UtcNow,
                    ExpiredAt = DateTime.UtcNow.AddHours(4)
                });

                _otpStore.Remove(verifyOtpRequest.Email);

                return Ok(new
                {
                    Token = tokenString,
                    User = new
                    {
                        Id = utilisateur.Id,
                        Email = utilisateur.Email
                    },
                    Message = "Connexion réussie."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));

                // Marquer la session comme expirée
                await connection.ExecuteAsync(
                    "UPDATE SESSIONS SET EXPIRED_AT = CURRENT_TIMESTAMP WHERE TOKEN = :Token",
                    new { Token = token });

                return Ok(new { Message = "Déconnexion réussie." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        public class VerifyOtpRequest
        {
            public string Email { get; set; }
            public string Otp { get; set; }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Utilisateur registerRequest)
        {
            try
            {
                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));
                // Vérifiez si l'utilisateur existe déjà
                var existingUser = await connection.QueryFirstOrDefaultAsync<Utilisateur>(
                    "SELECT * FROM UTILISATEUR WHERE EMAIL = :Email",
                    new { Email = registerRequest.Email });

                if (existingUser != null)
                {
                    return BadRequest("Un utilisateur avec cet email existe déjà.");
                }

                // Hacher le mot de passe
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password);

                // Insérer le nouvel utilisateur dans la base de données
                var sql = @"
            INSERT INTO UTILISATEUR (TYPEUTILISATEUR, NOM, PRENOM, EMAIL, TELEPHONE, ADRESSE, DATECREATION, PASSWORD)
            VALUES (:TypeUtilisateur, :Nom, :Prenom, :Email, :Telephone, :Adresse, CURRENT_TIMESTAMP, :Password)";
                await connection.ExecuteAsync(sql, new
                {
                    TypeUtilisateur = registerRequest.TypeUtilisateur,
                    Nom = registerRequest.Nom,
                    Prenom = registerRequest.Prenom,
                    Email = registerRequest.Email,
                    Telephone = registerRequest.Telephone,
                    Adresse = registerRequest.Adresse,
                    Password = hashedPassword
                });

                return Ok("Inscription réussie !");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("utilisateurs/{id}")]
        public async Task<IActionResult> EditUtilisateur(int id, [FromBody] UtilisateurUpdateRequest updateRequest)
        {
            try
            {
                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));

                var existingUser = await connection.QueryFirstOrDefaultAsync<Utilisateur>(
                    "SELECT * FROM UTILISATEUR WHERE ID = :Id",
                    new { Id = id });

                if (existingUser == null)
                {
                    return NotFound("Utilisateur non trouvé.");
                }

                var sql = @"
                UPDATE UTILISATEUR
                SET EMAIL = :Email
                WHERE ID = :Id";

                await connection.ExecuteAsync(sql, new
                {
                    Email = updateRequest.Email,
                    Id = id
                });

                return Ok("Utilisateur mis à jour avec succès !");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("utilisateurs/{id}")]
        public async Task<IActionResult> DeleteUtilisateur(int id)
        {
            try
            {
                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));

                var existingUser = await connection.QueryFirstOrDefaultAsync<Utilisateur>(
                    "SELECT * FROM UTILISATEUR WHERE ID = :Id",
                    new { Id = id });

                if (existingUser == null)
                {
                    return NotFound("Utilisateur non trouvé.");
                }

                var sql = "DELETE FROM UTILISATEUR WHERE ID = :Id";
                await connection.ExecuteAsync(sql, new { Id = id });

                return Ok("Utilisateur supprimé avec succès !");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        public class RegisterRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class UtilisateurUpdateRequest
        {
            public string Email { get; set; }
        }
        [Authorize]
        [HttpGet("validate-token")]
        public async Task<IActionResult> ValidateToken()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));

                var session = await connection.QueryFirstOrDefaultAsync(
                    "SELECT * FROM SESSIONS WHERE TOKEN = :Token AND EXPIRED_AT > CURRENT_TIMESTAMP",
                    new { Token = token });

                if (session == null)
                {
                    return Unauthorized("Token invalide ou session expirée.");
                }

                return Ok("Token valide.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [Authorize]
        [HttpPost("send-test-email")]
        public async Task<IActionResult> SendTestEmail()
        {
            try
            {
                var userEmail = User.Identity.Name; // Récupère l'email depuis le token JWT
                var emailService = new EmailService(_config);

                emailService.SendEmail(
                    userEmail,
                    "Email de test",
                    $"Bonjour {userEmail}, ceci est un email de test !"
                );

                return Ok("Email envoyé avec succès !");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}