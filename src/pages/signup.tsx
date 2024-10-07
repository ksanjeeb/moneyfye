import { Button, Card, Form, Input } from "antd";
import { useState } from "react";
import apiService from "../utils/service-utils";
import toast from "react-hot-toast";
import { setBearerToken } from "../utils/custom";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate()
    const onFinish = async (values: any) => {
        setLoading(true); 
        try {
            const payload = { username: values?.username, password: values?.password };
            const signupRes = await apiService.post('/auth/register', payload);
            if(signupRes.statusCode){toast.success(signupRes.message); return }
            toast.success("Signup successful!");
            if(signupRes?.access_token){
                setBearerToken(signupRes?.access_token);
                navigate("/add-account")
            }
        } catch (err:any) {
            toast.error(err?.message || "Failed");
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
                    <p className="text-xl">Signup</p>
                    <Form name="signup_form" layout="vertical" onFinish={onFinish}>
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
                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm your password" />
                        </Form.Item>
                        <Form.Item className="self-end">
                            <Button
                                type="primary"
                                className="w-full"
                                htmlType="submit"
                                loading={loading} // Bind loading state to button
                                disabled={loading} // Optional: disable the button while loading
                            >
                                {loading ? 'Signing up...' : 'Signup'}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default Signup;
