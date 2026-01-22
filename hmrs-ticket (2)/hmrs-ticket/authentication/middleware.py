import logging
import time

logger = logging.getLogger(__name__)

class APIAccessLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        self.log_request(request)
        
        start_time = time.time()
        # Process the request
        response = self.get_response(request)
        duration = time.time() - start_time
        
        self.log_response(request, response, duration)
        
        return response

    def log_request(self, request):
        try:
            user = getattr(request, 'user', None)
            user_id = user.id if user and user.is_authenticated else "None"
            user_name = user.username if user and user.is_authenticated else "Anonymous"
            
            logger.info(f"API REQUEST: {request.method} {request.path}")
            logger.info(f"  User: {user_name} (ID: {user_id})")
            logger.info(f"  IP Address: {request.META.get('REMOTE_ADDR', 'Unknown')}")
        except Exception:
            pass

    def log_response(self, request, response, duration):
        try:
            status_code = response.status_code
            # FIX: Emojis removed to prevent Windows crash
            logger.info(f"API RESPONSE: {status_code} for {request.method} {request.path}")
            
            if status_code >= 400:
                logger.warning(f"  Error Response: {status_code}")
        except Exception:
            pass