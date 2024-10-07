import { Button, Card, Form, Input } from "antd";
import { useState } from "react";
import apiService from "../utils/service-utils";
import toast from "react-hot-toast";
import { setBearerToken } from "../utils/custom";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = { username: values?.username, password: values?.password };
            const loginRes = await apiService.post('/auth/login', payload);
            if (loginRes.statusCode) {
                toast.error(loginRes.message);
                return;
            }

            toast.success("Login successful!");
            if (loginRes?.access_token) {
                setBearerToken(loginRes?.access_token);
                navigate("/dashboard"); 
            }
        } catch (err: any) {
            toast.error(err?.message || "Login failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen grid place-items-center">
            <Card className="md:w-1/4">
                <div className="flex flex-col gap-2">
                    <p className="flex items-center font-bold text-3xl pb-4">
                        <img
                            src="/logo.svg"
                            alt="Moneyfye Logo"
                            className="w-8 h-8 mr-2"
                        />
                        <span className="text-orange-400 pb-1">Moneyfye</span>
                    </p>
                    <p className="text-xl">Login</p>
                    <Form name="login_form" layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: 'Please enter your username!' }]}
                        >
                            <Input placeholder="Enter your username" />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please enter your password!' }]}
                        >
                            <Input.Password placeholder="Enter your password" />
                        </Form.Item>
                        <Form.Item className="self-end">
                            <Button
                                type="primary"
                                className="w-full"
                                htmlType="submit"
                                loading={loading} 
                                disabled={loading} 
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default Login;
