import os
import time
import random
import string
import threading
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
from app.logs import logger
from app.services.database.redis_service import redis_service

load_dotenv()
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL")

def generate_verification_code(length=6):
    """Generate a random verification code containing uppercase letters and digits."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

class EmailService:
    """
    A service class for handling email operations including sending verification codes
    and managing email verification for the SKEMA Business School RAN-PGE Prep App.
    """
    def __init__(self):
        """Initialize the EmailService with SendGrid configuration and Redis for verification codes."""
        self.sendgrid_api_key = SENDGRID_API_KEY
        self.from_email = FROM_EMAIL
        self.company_name = "SKEMA Business School"
        
        # Use the centralized Redis service
        self.redis_service = redis_service
        
        # Fallback in-memory storage if Redis is not available
        if not self.redis_service.is_connected():
            logger.warning("⚠️ Redis not available, falling back to in-memory storage for verification codes")
            self.verification_codes = {}
            self._lock = threading.Lock()
        else:
            logger.info("✅ EmailService using Redis for verification codes")
    
    def send_email(self, subject, body, to_email):
        """Send an HTML email using SendGrid API."""
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                html_content=body
            )

            sg = SendGridAPIClient(api_key=self.sendgrid_api_key)
            response = sg.send(message)
            logger.info(f"Email sent successfully to {to_email}")
            
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_verification_code(self, email: str):
        """Generate and send a verification code email to the specified email address."""
        code = generate_verification_code()
        
        subject = "SKEMA Business School - Verification Code for RAN-PGE Prep App"
        
        content = {
            "title": "Welcome to RAN-PGE!",
            "recipient": "Student", 
            "app_name": "Prep App",
            "app_next": "Bridging Program for French Grandes Écoles Admissions"
        }
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <table width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
                <tr>
                    <td style="text-align: center;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Skema_Business_School_Logo.png" alt="SKEMA Business School" style="width: 120px; margin-bottom: 20px;" />
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; color: #333333;">
                        <h2 style="color: #007bff;">{content['title']}</h2>
                        <p style="font-size: 16px; color: #555555;">
                            Dear {content['recipient']},<br><br>
                            To complete your registration on the <strong>{content['app_name']}</strong></br>,
                            <strong>{content['app_next']}</strong></br>, 
                            please use the verification code below to verify your email address.
                        </p>
                        <p style="font-size: 14px; color: #ff5733; font-weight: bold;">
                            This code is valid for two minutes.
                        </p>
                        <p style="font-size: 20px; color: #007bff; font-weight: bold; border: 1px solid #007bff; padding: 10px 20px; border-radius: 4px; display: inline-block;">
                            {code}
                        </p>
                        <p style="font-size: 14px; color: #999999;">
                            If you did not request this code, please ignore this email.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; padding-top: 20px;">
                        <p style="font-size: 14px; color: #888888;">
                            Best regards,<br>
                            <strong>{self.company_name} Team</strong>
                        </p>
                        <p style="font-size: 12px; color: #cccccc;">
                            {self.company_name} | {self.company_name} Lille - Avenue Willy Brandt, 59777, France Lille | https://www.skema.edu/fr/contact
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        email_sent = self.send_email(subject=subject, body=body, to_email=email)
        
        if email_sent:
            self._store_verification_code(email, code)
            return True
        else:
            logger.error(f"Failed to send verification code email to: {email}")
            return False
    
    def _store_verification_code(self, email: str, code: str):
        """Store verification code in Redis or fallback to memory."""
        if self.redis_service.is_connected():
            try:
                verification_data = {
                    "code": code,
                    "email": email,
                    "created_at": time.time()
                }
                success = self.redis_service.set_with_ttl(
                    f"verification_code:{email}", 
                    verification_data, 
                    120  # 120 seconds TTL
                )
                if success:
                    logger.info(f"Verification code stored in Redis for email: {email}")
                else:
                    raise Exception("Failed to store in Redis")
            except Exception as e:
                logger.error(f"Failed to store verification code in Redis: {str(e)}")
                self._store_in_memory(email, code)
        else:
            self._store_in_memory(email, code)
    
    def _store_in_memory(self, email: str, code: str):
        """Fallback to in-memory storage."""
        with self._lock:
            self.verification_codes[email] = (code, time.time())
            logger.info(f"Verification code stored in memory for email: {email}")

    def verify_code(self, email, code):
        """Verify a submitted verification code against the stored code."""
        logger.info(f"Attempting to verify code for email: {email}")
        
        if self.redis_service.is_connected():
            return self._verify_code_redis(email, code)
        else:
            return self._verify_code_memory(email, code)
    
    def _verify_code_redis(self, email: str, code: str) -> bool:
        """Verify code using Redis storage."""
        try:
            verification_data = self.redis_service.get(f"verification_code:{email}", deserialize_json=True)
            if not verification_data:
                logger.warning(f"No verification code found in Redis for email: {email}")
                return False
            
            stored_code = verification_data["code"]
            
            if stored_code == code:
                # Delete the code after successful verification
                self.redis_service.delete(f"verification_code:{email}")
                logger.info(f"Verification code successfully verified for email: {email}")
                return True
            else:
                logger.warning(f"Invalid verification code provided for email: {email}")
                return False
                
        except Exception as e:
            logger.error(f"Error verifying code in Redis: {str(e)}")
            # Fallback to memory verification if available
            if hasattr(self, 'verification_codes'):
                return self._verify_code_memory(email, code)
            return False
    
    def _verify_code_memory(self, email: str, code: str) -> bool:
        """Verify code using in-memory storage."""
        self._cleanup_expired_codes()
        
        with self._lock:
            if email not in self.verification_codes:
                logger.warning(f"No verification code found for email: {email}")
                return False
            
            stored_code, timestamp = self.verification_codes[email]
            current_time = time.time()
            
            if (current_time - timestamp) > 120:
                del self.verification_codes[email]
                logger.warning(f"Verification code expired for email: {email}")
                return False
            
            if stored_code == code:
                del self.verification_codes[email]
                logger.info(f"Verification code successfully verified for email: {email}")
                return True
            else:
                logger.warning(f"Invalid verification code provided for email: {email}")
                return False
    
    def _cleanup_expired_codes(self):
        """Remove expired verification codes from memory storage."""
        if not hasattr(self, 'verification_codes'):
            return
            
        current_time = time.time()
        expired_emails = []
        
        with self._lock:
            for email, (code, timestamp) in self.verification_codes.items():
                if (current_time - timestamp) > 120:
                    expired_emails.append(email)
            
            for email in expired_emails:
                del self.verification_codes[email]
                logger.debug(f"Expired verification code removed for email: {email}")

# Lazy singleton for multiworker compatibility
_email_service_instance = None

def get_email_service() -> EmailService:
    """
    Get the global EmailService instance using lazy singleton pattern.
    Thread-safe for multiworker environments.
    """
    global _email_service_instance
    if _email_service_instance is None:
        _email_service_instance = EmailService()
    return _email_service_instance

email_service = get_email_service()