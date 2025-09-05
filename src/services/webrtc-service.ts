// src/services/webrtc-service.ts
import { io, Socket } from 'socket.io-client';

export class WebRTCService {
    private socket: Socket;
    private peerConnection: RTCPeerConnection;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private currentCallId: string = '';

    // Callbacks
    public onRemoteStream?: (stream: MediaStream) => void;
    public onCallEnded?: () => void;
    public onConnectionStateChange?: (state: string) => void;

    constructor() {
        console.log('🔧 Initializing WebRTC Service...');

        // For local testing
        const SERVER_URL = 'http://192.168.1.149:3000';

        try {
            this.socket = io(SERVER_URL, {
                transports: ['websocket', 'polling'],
                timeout: 10000
            });

            // WebRTC configuration
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            this.setupPeerConnection();
            this.setupSocketListeners();

            console.log('✅ WebRTC Service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize WebRTC Service:', error);
            throw error;
        }
    }

    private setupPeerConnection() {
        // Handle incoming remote stream
        this.peerConnection.ontrack = (event) => {
            console.log('📹 Received remote stream');
            this.remoteStream = event.streams[0];
            this.onRemoteStream?.(this.remoteStream);
        };

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('🔗 Sending ICE candidate');
                this.socket.emit('ice-candidate', {
                    callId: this.currentCallId,
                    candidate: event.candidate
                });
            }
        };

        // Monitor connection state
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('🔗 Connection state:', state);
            this.onConnectionStateChange?.(state);

            if (state === 'disconnected' || state === 'failed') {
                this.onCallEnded?.();
            }
        };
    }

    private setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to signaling server:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from signaling server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('🚫 Connection error:', error);
        });

        this.socket.on('webrtc-offer', async ({ offer }) => {
            console.log('📩 Received WebRTC offer');
            try {
                await this.peerConnection.setRemoteDescription(offer);
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);

                this.socket.emit('webrtc-answer', {
                    callId: this.currentCallId,
                    answer
                });
            } catch (error) {
                console.error('❌ Error handling offer:', error);
            }
        });

        this.socket.on('webrtc-answer', async ({ answer }) => {
            console.log('📩 Received WebRTC answer');
            try {
                await this.peerConnection.setRemoteDescription(answer);
            } catch (error) {
                console.error('❌ Error handling answer:', error);
            }
        });

        this.socket.on('ice-candidate', async ({ candidate }) => {
            console.log('🔗 Received ICE candidate');
            try {
                await this.peerConnection.addIceCandidate(candidate);
            } catch (error) {
                console.error('❌ Error handling ICE candidate:', error);
            }
        });

        this.socket.on('call-ended', () => {
            console.log('📞 Call ended by remote peer');
            this.cleanup();
            this.onCallEnded?.();
        });
    }

    // Register user (patient or doctor)
    public register(userId: string, userType: 'patient' | 'doctor', userInfo: any) {
        console.log(`📝 Registering as ${userType}:`, userId);
        this.socket.emit('register', { userId, userType, userInfo });
    }

    // Start local media stream
    public async startLocalStream(videoEnabled: boolean = true, audioEnabled: boolean = true): Promise<MediaStream> {
        try {
            console.log('📹 Starting local stream...');
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: videoEnabled ? { width: 640, height: 480 } : false,
                audio: audioEnabled
            });

            // Add local stream to peer connection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream!);
            });

            console.log('✅ Local stream started successfully');
            return this.localStream;
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            throw error;
        }
    }

    // Initiate WebRTC call
    public async initiateCall(callId: string) {
        console.log('🚀 Initiating WebRTC call:', callId);
        this.currentCallId = callId;

        try {
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await this.peerConnection.setLocalDescription(offer);

            this.socket.emit('webrtc-offer', {
                callId,
                offer
            });
        } catch (error) {
            console.error('❌ Error creating offer:', error);
        }
    }

    // Call doctor (from patient)
    public callDoctor(doctorId: string, patientId: string, patientInfo: any) {
        console.log('📞 Calling doctor:', doctorId);
        this.socket.emit('initiate-call', {
            doctorId,
            patientId,
            patientInfo
        });
    }

    // Accept incoming call (from doctor)
    public acceptCall(callId: string) {
        console.log('✅ Accepting call:', callId);
        this.currentCallId = callId;
        this.socket.emit('accept-call', { callId });
    }

    // Reject incoming call (from doctor)
    public rejectCall(callId: string) {
        console.log('❌ Rejecting call:', callId);
        this.socket.emit('reject-call', { callId });
    }

    // Toggle video
    public toggleVideo(enabled: boolean) {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = enabled;
                console.log('📹 Video toggled:', enabled);
            }
        }
    }

    // Toggle audio
    public toggleAudio(enabled: boolean) {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = enabled;
                console.log('🎵 Audio toggled:', enabled);
            }
        }
    }

    // End call
    public endCall() {
        console.log('🔚 Ending call');
        this.socket.emit('end-call', { callId: this.currentCallId });
        this.cleanup();
    }

    // Cleanup resources
    private cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            // Recreate peer connection for future calls
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            this.setupPeerConnection();
        }

        this.currentCallId = '';
        this.remoteStream = null;
    }

    // Disconnect from server
    public disconnect() {
        this.cleanup();
        this.socket.disconnect();
    }

    // Get socket for additional event listeners
    public getSocket() {
        return this.socket;
    }
}
