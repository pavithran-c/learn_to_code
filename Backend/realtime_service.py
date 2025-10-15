"""
Real-time service for handling WebSocket connections and live updates
"""
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import json
from datetime import datetime
from auth_service import AuthService

class RealTimeService:
    def __init__(self, app=None):
        self.socketio = None
        self.active_sessions = {}
        self.user_rooms = {}
        self.auth_service = AuthService()
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize SocketIO with Flask app"""
        self.socketio = SocketIO(app, cors_allowed_origins="*", 
                                async_mode='threading')
        self.setup_handlers()
        return self.socketio
    
    def setup_handlers(self):
        """Setup WebSocket event handlers"""
        
        @self.socketio.on('connect')
        def handle_connect(auth):
            """Handle client connection"""
            try:
                # Verify authentication
                token = auth.get('token') if auth else None
                if not token:
                    return False
                
                user_data = self.auth_service.verify_token(token)
                if not user_data or not user_data.get('valid'):
                    return False
                
                user_id = user_data.get('user_id')
                username = user_data.get('email', 'Unknown')  # Use email as username fallback
                
                # Join user to their personal room
                join_room(f"user_{user_id}")
                
                # Track active session
                self.active_sessions[request.sid] = {
                    'user_id': user_id,
                    'username': username,
                    'connected_at': datetime.now(),
                    'last_activity': datetime.now()
                }
                
                self.user_rooms[user_id] = request.sid
                
                # Emit connection success
                emit('connected', {
                    'status': 'success',
                    'user_id': user_id,
                    'username': username,
                    'timestamp': datetime.now().isoformat()
                })
                
                # Broadcast user online status
                self.broadcast_user_status(user_id, username, 'online')
                
                print(f"User {username} connected via WebSocket")
                return True
                
            except Exception as e:
                print(f"Connection error: {e}")
                return False
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            """Handle client disconnection"""
            try:
                session = self.active_sessions.get(request.sid)
                if session:
                    user_id = session['user_id']
                    username = session['username']
                    
                    # Cleanup
                    del self.active_sessions[request.sid]
                    if user_id in self.user_rooms:
                        del self.user_rooms[user_id]
                    
                    # Broadcast user offline status
                    self.broadcast_user_status(user_id, username, 'offline')
                    
                    print(f"User {username} disconnected from WebSocket")
                    
            except Exception as e:
                print(f"Disconnection error: {e}")
        
        @self.socketio.on('join_room')
        def handle_join_room(data):
            """Handle room joining for group features"""
            try:
                room = data.get('room')
                if room:
                    join_room(room)
                    emit('joined_room', {'room': room})
            except Exception as e:
                print(f"Join room error: {e}")
        
        @self.socketio.on('leave_room')
        def handle_leave_room(data):
            """Handle room leaving"""
            try:
                room = data.get('room')
                if room:
                    leave_room(room)
                    emit('left_room', {'room': room})
            except Exception as e:
                print(f"Leave room error: {e}")
        
        @self.socketio.on('ping')
        def handle_ping():
            """Handle ping for keeping connection alive"""
            session = self.active_sessions.get(request.sid)
            if session:
                session['last_activity'] = datetime.now()
            emit('pong', {'timestamp': datetime.now().isoformat()})
    
    def broadcast_user_status(self, user_id, username, status):
        """Broadcast user online/offline status"""
        try:
            self.socketio.emit('user_status_change', {
                'user_id': user_id,
                'username': username,
                'status': status,
                'timestamp': datetime.now().isoformat()
            }, broadcast=True)
        except Exception as e:
            print(f"Broadcast error: {e}")
    
    def send_to_user(self, user_id, event, data):
        """Send message to specific user"""
        try:
            room = f"user_{user_id}"
            self.socketio.emit(event, data, room=room)
        except Exception as e:
            print(f"Send to user error: {e}")
    
    def broadcast_to_all(self, event, data):
        """Broadcast message to all connected users"""
        try:
            self.socketio.emit(event, data, broadcast=True)
        except Exception as e:
            print(f"Broadcast error: {e}")
    
    def send_activity_update(self, user_id, activity_data):
        """Send activity update to user"""
        self.send_to_user(user_id, 'activity_update', {
            'timestamp': datetime.now().isoformat(),
            **activity_data
        })
    
    def send_achievement_notification(self, user_id, achievement_data):
        """Send achievement notification to user"""
        self.send_to_user(user_id, 'achievement_unlocked', {
            'timestamp': datetime.now().isoformat(),
            **achievement_data
        })
    
    def send_progress_update(self, user_id, progress_data):
        """Send progress update to user"""
        self.send_to_user(user_id, 'progress_update', {
            'timestamp': datetime.now().isoformat(),
            **progress_data
        })
    
    def send_challenge_update(self, user_id, challenge_data):
        """Send challenge update to user"""
        self.send_to_user(user_id, 'challenge_update', {
            'timestamp': datetime.now().isoformat(),
            **challenge_data
        })
    
    def get_active_users(self):
        """Get list of currently active users"""
        return [
            {
                'user_id': session['user_id'],
                'username': session['username'],
                'connected_at': session['connected_at'].isoformat(),
                'last_activity': session['last_activity'].isoformat()
            }
            for session in self.active_sessions.values()
        ]
    
    def get_user_count(self):
        """Get total count of active users"""
        return len(self.active_sessions)

# Global instance
realtime_service = RealTimeService()