import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Smartphone, 
  Key, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface MFAVerificationProps {
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

export function MFAVerification({ onVerificationSuccess, onCancel }: MFAVerificationProps) {
  const { user, verifyMFA } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const handleVerification = useCallback(async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Codul de verificare trebuie să aibă 6 cifre');
      return;
    }

    if (attempts >= maxAttempts) {
      setError('Ai depășit numărul maxim de încercări. Contul a fost blocat temporar.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const success = await verifyMFA(verificationCode);
      
      if (success) {
        onVerificationSuccess();
      } else {
        setAttempts(prev => prev + 1);
        setError(`Cod de verificare incorect. Încercări rămase: ${maxAttempts - attempts - 1}`);
        setVerificationCode('');
      }
    } catch (err) {
      setError('Eroare la verificarea codului MFA');
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, attempts, maxAttempts, verifyMFA, onVerificationSuccess]);

  const handleResendCode = useCallback(() => {
    // In real app, this would request a new code
    setError(null);
    setVerificationCode('');
    setAttempts(0);
  }, []);

  const isBlocked = attempts >= maxAttempts;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Verificare MFA</CardTitle>
          <p className="text-sm text-muted-foreground">
            Contul tău este protejat cu autentificare în doi factori
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">{user?.email}</Badge>
              <Badge variant="secondary">MFA Activ</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Introdu codul de 6 cifre din aplicația ta de autentificare
            </p>
          </div>

          {/* Verification Code Input */}
          <div className="space-y-3">
            <Label htmlFor="verification-code">Cod de verificare:</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
              disabled={isBlocked}
            />
            <p className="text-xs text-muted-foreground text-center">
              Codul de 6 cifre din aplicația ta de autentificare
            </p>
          </div>

          {/* Attempts Counter */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Încercări:</span>
              <div className="flex gap-1">
                {Array.from({ length: maxAttempts }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < attempts ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {attempts}/{maxAttempts}
              </span>
            </div>
          </div>

          {/* Error Messages */}
          {error && (
            <Alert variant={isBlocked ? "destructive" : "destructive"}>
              {isBlocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {!error && attempts > 0 && !isBlocked && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Codul a fost verificat. Încercări rămase: {maxAttempts - attempts}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleVerification}
              disabled={!verificationCode.trim() || verificationCode.length !== 6 || isLoading || isBlocked}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifică...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Verifică
                </>
              )}
            </Button>

            {!isBlocked && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Trimite din nou
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Anulează
                </Button>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Nu ai aplicația de autentificare?
            </p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <Badge variant="outline">Google Authenticator</Badge>
              <Badge variant="outline">Authy</Badge>
              <Badge variant="outline">Microsoft Authenticator</Badge>
            </div>
          </div>

          {/* Blocked Account Info */}
          {isBlocked && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Contul tău a fost blocat temporar din cauza încercărilor multiple eșuate. 
                Contactează suportul pentru deblocare sau încearcă din nou în 15 minute.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MFAVerification;
