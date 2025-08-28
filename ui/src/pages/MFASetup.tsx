import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import MFASystem from '@/components/MFASystem';

export default function MFASetup() {
  const { user, mfaRequired, mfaVerified } = useAuth();
  const [showSetup, setShowSetup] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acces Restricționat</h2>
            <p className="text-muted-foreground">
              Trebuie să fii autentificat pentru a accesa această pagină.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSetup) {
    return (
      <MFASystem
        onSetupComplete={() => setShowSetup(false)}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold">Multi-Factor Authentication</h1>
        <p className="text-muted-foreground">
          Protejează-ți contul cu autentificare în doi factori
        </p>
      </div>

      {/* Status Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Status MFA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {mfaRequired && mfaVerified ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : mfaRequired ? (
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              ) : (
                <Lock className="w-6 h-6 text-gray-600" />
              )}
              <div>
                <div className="font-medium">
                  {mfaRequired && mfaVerified ? 'MFA Activ și Verificat' : 
                   mfaRequired ? 'MFA Activ dar Neverificat' : 'MFA Inactiv'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {mfaRequired && mfaVerified ? 'Contul tău este protejat cu autentificare în doi factori' :
                   mfaRequired ? 'MFA este activat dar trebuie verificat' : 'Contul tău nu este protejat cu MFA'}
                </div>
              </div>
            </div>
            <Badge variant={mfaRequired && mfaVerified ? 'default' : mfaRequired ? 'secondary' : 'outline'}>
              {mfaRequired && mfaVerified ? 'Securizat' : mfaRequired ? 'Activ' : 'Inactiv'}
            </Badge>
          </div>

          {/* User Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Informații Cont</span>
            </div>
            <div className="text-sm text-blue-800">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Status MFA:</strong> {mfaRequired ? 'Activ' : 'Inactiv'}</p>
              <p><strong>Verificare:</strong> {mfaVerified ? 'Completă' : 'În așteptare'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!mfaRequired ? (
              <Button
                onClick={() => setShowSetup(true)}
                className="w-full"
                size="lg"
              >
                <Shield className="w-4 h-4 mr-2" />
                Activează MFA
              </Button>
            ) : !mfaVerified ? (
              <Button
                onClick={() => setShowSetup(true)}
                className="w-full"
                size="lg"
                variant="secondary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Completează Verificarea MFA
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowSetup(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Gestionează MFA
                </Button>
                <Button
                  onClick={() => setShowSetup(true)}
                  className="w-full"
                  variant="destructive"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Dezactivează MFA
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Beneficii MFA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Securitate Avansată</div>
                <div className="text-sm text-muted-foreground">
                  Protecție împotriva accesului neautorizat
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium">Acces Mobil</div>
                <div className="text-sm text-muted-foreground">
                  Autentificare sigură de pe orice device
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-medium">Compliance</div>
                <div className="text-sm text-muted-foreground">
                  Respectă standardele de securitate
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium">Protecție Cont</div>
                <div className="text-sm text-muted-foreground">
                  Previne compromiterea contului
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Cum Funcționează MFA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <div className="font-medium">Instalează Aplicația</div>
                <div className="text-sm text-muted-foreground">
                  Descarcă Google Authenticator, Authy sau Microsoft Authenticator
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <div className="font-medium">Scanează QR Code</div>
                <div className="text-sm text-muted-foreground">
                  Scanează codul QR cu aplicația ta de autentificare
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <div className="font-medium">Verifică Codul</div>
                <div className="text-sm text-muted-foreground">
                  Introdu codul de 6 cifre pentru a finaliza setup-ul
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <div className="font-medium">Cont Securizat</div>
                <div className="text-sm text-muted-foreground">
                  Contul tău este acum protejat cu MFA
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
