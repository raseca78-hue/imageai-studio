# 🚀 ImageAI Studio - Guía de Inicio Rápido

## Tu negocio está LISTO para ganar dinero. Solo necesitas configurar 3 cosas:

---

## 📋 PASO 1: Crear cuenta en Stripe (5 minutos)

1. **Ve a** [stripe.com](https://stripe.com) y regístrate GRATIS
2. **Activa tu cuenta** (necesitarás verificar tu identidad)
3. **Obtén tus claves API**:
   - Ve a Developers → API Keys
   - Copia:
     - `Publishable key` (empieza con `pk_test_`)
     - `Secret key` (empieza con `sk_test_`)

---

## 📋 PASO 2: Crear los Productos en Stripe (5 minutos)

1. **Ve a** Stripe Dashboard → Products
2. **Crea el Plan Pro**:
   - Nombre: "Plan Pro"
   - Precio: $9.99 / mes
   - Copia el **Price ID** (empieza con `price_`)

3. **Crea el Plan Business**:
   - Nombre: "Plan Business"
   - Precio: $29.99 / mes
   - Copia el **Price ID**

---

## 📋 PASO 3: Configurar Webhook (3 minutos)

1. **Ve a** Stripe Dashboard → Webhooks
2. **Click en "Add endpoint"**
3. **URL del webhook**: `https://TU-DOMINIO.com/api/webhooks/stripe`
   - (En desarrollo local: usa ngrok o Stripe CLI)
4. **Eventos a escuchar**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Copia el Webhook Secret** (empieza con `whsec_`)

---

## 📋 PASO 4: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app

# Database (ya configurado)
DATABASE_URL="file:./db/custom.db"

# Auth
NEXTAUTH_SECRET=genera-un-secret-aleatorio
NEXTAUTH_URL=https://tu-dominio.vercel.app

# Stripe - REEMPLAZA CON TUS CLAVES REALES
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_real
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_real
STRIPE_PRO_PRICE_ID=price_id_plan_pro_real
STRIPE_BUSINESS_PRICE_ID=price_id_plan_business_real
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_real
```

---

## 📋 PASO 5: Desplegar en Vercel (5 minutos)

1. **Sube tu código a GitHub**
2. **Ve a** [vercel.com](https://vercel.com)
3. **Importa tu repositorio**
4. **Añade las variables de entorno** en Settings → Environment Variables
5. **Despliega**

---

## 🎉 ¡LISTO!

Tu negocio ya puede:
- ✅ Recibir pagos con tarjeta
- ✅ Crear suscripciones mensuales
- ✅ Gestionar usuarios automáticamente
- ✅ Renovar créditos cada día

---

## 💰 Proyecciones de Ingresos

| Usuarios Pro | Usuarios Business | Ingresos/mes |
|--------------|-------------------|--------------|
| 10 | 2 | $159.88 |
| 50 | 10 | $799.40 |
| 100 | 20 | $1,598.80 |
| 500 | 50 | $7,994.00 |

---

## 📣 Marketing Gratuito

1. **TikTok**: Videos mostrando imágenes generadas
2. **Instagram**: Reels con resultados virales
3. **Reddit**: r/aiart, r/SideProject
4. **Product Hunt**: Lanzamiento gratuito
5. **Twitter**: Comparte imágenes creadas

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs de Vercel
3. Comprueba que los webhooks funcionen en Stripe Dashboard

---

¡A ganar dinero! 💰🚀
