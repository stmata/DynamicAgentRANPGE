import os
import time
import random
import string
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from app.services.database.redis_service import redis_service
from app.logs import logger

load_dotenv()
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", GMAIL_USER)

def generate_verification_code(length=6):
    """
    Generate a random verification code containing uppercase letters and digits.
    
    Args:
        length (int): The length of the verification code to generate. Defaults to 6.
        
    Returns:
        str: A randomly generated verification code
    """
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

class EmailService:
    """
    A service class for handling email operations including sending verification codes
    and managing email verification for the SKEMA Business School RAN-PGE Prep App.
    """
    def __init__(self):
        """
        Initialize the EmailService with Gmail SMTP configuration and verification code storage.
        Sets up email credentials from environment variables and initializes in-memory storage
        for verification codes with thread safety.
        """
        self.gmail_user = GMAIL_USER
        self.gmail_password = GMAIL_PASSWORD
        self.from_email = FROM_EMAIL
        self.company_name = "SKEMA Business School"
    
    
    def send_email(self, subject, body, to_email):
        """
        Send an HTML email using Gmail SMTP server.
        
        Args:
            subject (str): The subject line of the email
            body (str): The HTML content of the email body
            to_email (str): The recipient's email address
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            part = MIMEText(body, 'html')
            msg.attach(part)

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(self.gmail_user, self.gmail_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_verification_code(self, email: str):
        """
        Generate and send a verification code email to the specified email address.
        The code is stored in memory with a timestamp for validation purposes.
        
        Args:
            email (str): The email address to send the verification code to
            
        Returns:
            bool: True if the verification email was sent successfully, False otherwise
        """
        code = generate_verification_code()
        timestamp = time.time()
        
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
                            <strong>SKEMA Business School Team</strong>
                        </p>
                        <p style="font-size: 12px; color: #cccccc;">
                            SKEMA Business School | SKEMA Business School Lille - Avenue Willy Brandt, 59777, France Lille | https://www.skema.edu/fr/contact
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        # Send email first, only store code if email is sent successfully
        email_sent = self.send_email(subject=subject, body=body, to_email=email)
        
        if email_sent:
            success = redis_service.set_with_ttl(f"verification_code:{email}", code, 120)
            logger.info(f"Verification code generated and stored for email: {email} - Redis success: {success}")
            
            return True
        else:
            logger.error(f"Failed to send verification code email to: {email}")
            return False

    def verify_code(self, email, code):
        """
        Verify a submitted verification code against the stored code for the given email.
        Automatically cleans up expired codes before verification and removes the code
        upon successful verification.
        
        Args:
            email (str): The email address associated with the verification code
            code (str): The verification code to validate
            
        Returns:
            bool: True if the code is valid and matches, False otherwise
        """
        logger.info(f"Attempting to verify code for email: {email}")
        
        # Clean up expired codes first
        if not redis_service.is_connected():
            logger.error("Redis is not connected")
            return False
        
        stored_code = redis_service.get(f"verification_code:{email}")
        logger.info(f"Retrieved code from Redis for {email}: {stored_code}")

        if not stored_code:
            logger.warning(f"No verification code found for email: {email}")
            return False

        # Check if code matches
        if stored_code == code:
            redis_service.delete(f"verification_code:{email}")
            logger.info(f"Verification code successfully verified for email: {email}")
            return True
        else:
            logger.warning(f"Invalid verification code provided for email: {email}")
            return False


email_service = EmailService()