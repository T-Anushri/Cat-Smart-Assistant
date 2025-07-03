import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface OperatorLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, operator: any) => void;
}

const OperatorLoginModal: React.FC<OperatorLoginModalProps> = ({ open, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/operators/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      let data = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error: Non-JSON response");
      }
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLoginSuccess(data.token, data.operator);
      setEmail("");
      setPassword("");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Operator Login</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OperatorLoginModal;
