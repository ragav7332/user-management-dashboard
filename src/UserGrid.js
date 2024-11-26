import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { EditOutlined, DeleteOutlined,PlusOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Form, message ,Card} from "antd";
import axios from "axios";
import './index.css';

const UserGrid = () => {
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const apiBase = "https://jsonplaceholder.typicode.com/users";

  // Fetch data on mount
  useEffect(() => {
    axios.get(apiBase).then((response) => {
      const processedData = response.data.map((user) => {
        const [firstName, ...rest] = user.name.split(" ");
        return {
          id: user.id,
          firstName: firstName || user.name,
          lastName: rest.join(" ") || "",
          email: user.email,
          department: user.company?.name || "N/A",
        };
      });
      setRowData(processedData);
      setFilteredData(processedData);
    });
  }, []);

  const showSuccess = (text) => {
    messageApi.success(text);
  };

  const handleDelete = (id) => {
    axios.delete(`${apiBase}/${id}`).then(() => {
      setRowData((prevData) => prevData.filter((user) => user.id !== id));
      setFilteredData((prevData) => prevData.filter((user) => user.id !== id));
      showSuccess("User deleted successfully!");
    });
  };

  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        axios.put(`${apiBase}/${editingUser.id}`, values).then(() => {
          const updatedData = rowData.map((user) =>
            user.id === editingUser.id ? { ...user, ...values } : user
          );
          setRowData(updatedData);
          setFilteredData(updatedData);
          showSuccess("User updated successfully!");
        });
      } else {
        axios.post(apiBase, values).then((response) => {
            // Find the highest current ID and increment it
            const highestId = rowData.reduce((max, user) => Math.max(max, user.id), 0);
            const newUser = { ...response.data, id: highestId + 1 }; // Assign the next sequential ID
          
            // Update state with the new user
            setRowData((prevData) => [...prevData, newUser]);
            setFilteredData((prevData) => [...prevData, newUser]);
            showSuccess("User added successfully!");
          });
      }
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = rowData.filter(
      (user) =>
        user.firstName.toLowerCase().includes(value) ||
        user.lastName.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.department.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const columnDefs = [
    { field: "id", headerName: "ID", sortable: true, filter: true ,headerClass: "custom-header" },
    { field: "firstName", headerName: "First Name", sortable: true ,headerClass: "custom-header" },
    { field: "lastName", headerName: "Last Name", sortable: true,headerClass: "custom-header"  },
    { field: "email", headerName: "Email", sortable: true,headerClass: "custom-header"  },
    { field: "department", headerName: "Department", sortable: true ,headerClass: "custom-header" },
    {
      headerName: "Actions",
      headerClass: "custom-header",
      cellRenderer: (params) => (
        <>
           <Button
          type="primary"
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => showModal(params.data)}
          style={{ marginRight: 8 }}
        />
        <Button
          type="primary"
          danger
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(params.data.id)}
        />
        </>
      ),
    },
  ];

  return (
    <Card className="grid-card">
    <div>
      {contextHolder}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by any field..."
          value={search}
          onChange={handleSearch}
          style={{ width: 300, marginRight: 10 }}
        />
        <Button type="primary" onClick={() => showModal()} icon={<PlusOutlined />} >
          Add 
        </Button>
      </div>
      <div className="ag-theme-alpine" style={{ height: 500 }}>
        <AgGridReact className="grid-table" rowData={filteredData} pagination={true} columnDefs={columnDefs.map((column)=>({
            ...column,
            width: column.width || 260,

        }))} />
      </div>
      <Modal
        title={editingUser ? "Edit" : "Add "}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingUser ? "Update" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "Please enter first name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: "Please enter last name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please enter department!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </Card>
  );
};

export default UserGrid;
