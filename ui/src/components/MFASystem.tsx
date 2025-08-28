import { useState, useEffect, useCallback } from 'react';
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
  Download,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  isEnabled: boolean;
}

interface MFASystemProps {
  onSetupComplete?: () => void;
  onCancel?: () => void;
}

export function MFASystem({ onSetupComplete, onCancel }: MFASystemProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled' | 'disabled'>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [mfaData, setMfaData] = useState<MFASetupData | null>(null);

  // Simulate MFA setup data
  const generateMFASetup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const secret = generateSecret();
      const qrCodeUrl = generateQRCode(secret, user?.email || 'user@example.com');
      const backupCodes = generateBackupCodes();
      
      setMfaData({
        secret,
        qrCodeUrl,
        backupCodes,
        isEnabled: false
      });
      
      setStep('setup');
      setSuccess('MFA setup generat cu succes!');
    } catch (err) {
      setError('Eroare la generarea setup-ului MFA');
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  const verifyMFACode = useCallback(async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Codul de verificare trebuie să aibă 6 cifre');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple verification (in real app, verify against TOTP)
      if (verificationCode === '123456') {
        setSuccess('MFA activat cu succes!');
        setStep('enabled');
        if (mfaData) {
          setMfaData({ ...mfaData, isEnabled: true });
        }
        onSetupComplete?.();
      } else {
        setError('Cod de verificare incorect. Încearcă din nou.');
      }
    } catch (err) {
      setError('Eroare la verificarea codului MFA');
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, mfaData, onSetupComplete]);

  const disableMFA = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('disabled');
      setSuccess('MFA dezactivat cu succes!');
      if (mfaData) {
        setMfaData({ ...mfaData, isEnabled: false });
      }
    } catch (err) {
      setError('Eroare la dezactivarea MFA');
    } finally {
      setIsLoading(false);
    }
  }, [mfaData]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copiat în clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Eroare la copierea în clipboard');
    }
  }, []);

  const downloadBackupCodes = useCallback(() => {
    if (!mfaData?.backupCodes) return;
    
    const content = `Backup Codes pentru ${user?.email || 'user'}:\n\n${mfaData.backupCodes.join('\n')}\n\nPăstrează acești coduri într-un loc sigur!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [mfaData?.backupCodes, user?.email]);

  // Generate functions
  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateQRCode = (secret: string, email: string) => {
    const issuer = 'TechAnal';
    const otpauth = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  useEffect(() => {
    if (step === 'setup') {
      generateMFASetup();
    }
  }, [step, generateMFASetup]);

  if (step === 'enabled') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">MFA Activ!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              Contul tău este acum protejat cu autentificare în doi factori.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Backup Codes:</h4>
            <div className="grid grid-cols-2 gap-2">
              {mfaData?.backupCodes.map((code, index) => (
                <Badge key={index} variant="outline" className="font-mono text-xs">
                  {code}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Descarcă
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(mfaData?.backupCodes.join('\n') || '')}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiază
              </Button>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={disableMFA}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Dezactivează...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Dezactivează MFA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'disabled') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">MFA Dezactivat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Contul tău nu mai este protejat cu autentificare în doi factori.
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={() => setStep('setup')}
            className="w-full"
          >
            <Lock className="w-4 h-4 mr-2" />
            Activează din nou MFA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Setup Step */}
      {step === 'setup' && mfaData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Configurare MFA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-48 h-48 bg-white p-4 rounded-lg border">
                <img 
                  src={mfaData.qrCodeUrl} 
                  alt="QR Code MFA" 
                  className="w-full h-full"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Scanează acest QR code cu aplicația ta de autentificare:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline">Google Authenticator</Badge>
                  <Badge variant="outline">Authy</Badge>
                  <Badge variant="outline">Microsoft Authenticator</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Secret Key (manual entry):</Label>
              <div className="flex gap-2">
                <Input
                  value={mfaData.secret}
                  readOnly
                  type={showSecret ? 'text' : 'password'}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(mfaData.secret)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Backup Codes:</Label>
              <div className="grid grid-cols-2 gap-2">
                {mfaData.backupCodes.map((code, index) => (
                  <Badge key={index} variant="outline" className="font-mono text-xs">
                    {code}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadBackupCodes}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descarcă
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(mfaData.backupCodes.join('\n'))}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiază
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('verify')}
                className="flex-1"
                disabled={isLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Continuă
              </Button>
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Anulează
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Step */}
      {step === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Verificare MFA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold">Introdu codul de verificare</h3>
                <p className="text-sm text-muted-foreground">
                  Deschide aplicația ta de autentificare și introdu codul de 6 cifre
                </p>
              </div>

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
                />
                <p className="text-xs text-muted-foreground text-center">
                  Codul de 6 cifre din aplicația ta de autentificare
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={verifyMFACode}
                  disabled={!verificationCode.trim() || verificationCode.length !== 6 || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifică...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verifică
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  className="flex-1"
                >
                  Înapoi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !mfaData && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Se generează setup-ul MFA...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MFASystem;
